import random
import uuid

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone

from fmm.payment import errors
from fmm.utils.constants.enums import (TRANSACTION_PROVIDERS, RP_TRANSACTION_VERIFICATION,
                                       RP_TRANSACTION_SALE, TRANSACTION_STATUSES,
                                       RP_TRANSACTION_AUTH, CURRENCIES)
from fmm.utils.constants.table_names import (USER_CARD_CREDENTIALS_TABLE_NAME,
                                             TRANSACTION_TABLE_NAME, PTP_TRANSACTION_TABLE_NAME)
from fmm.utils.constants.transactions import TRANSACTION_HANDLERS
from fmm.utils.global_request import get_current_user, get_current_request
from fmm.utils.helper import validate_luhn, get_client_ip, get_my_ip


class AbstractTransaction(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order_id = models.TextField(null=True, blank=True)
    external_id = models.TextField(null=True, blank=True)

    status = models.CharField(max_length=255, choices=TRANSACTION_STATUSES,
                              default=TRANSACTION_STATUSES.CREATED)
    external_status = models.CharField(max_length=255, null=True, blank=True)

    ip_address = models.CharField(max_length=255, null=True, blank=True, editable=False)

    call_back_url = models.CharField(max_length=255)

    description = models.TextField(null=True, blank=True)

    # transaction type
    action = models.TextField(default='CHARGE', editable=False)
    kind = models.TextField(default=RP_TRANSACTION_SALE, editable=False)

    amount = models.DecimalField(max_digits=9, decimal_places=4)
    fee = models.DecimalField(null=True, blank=True, max_digits=9, decimal_places=4)
    currency = models.TextField(choices=CURRENCIES, default=CURRENCIES.INR, editable=False)

    card_creds = models.ForeignKey("payment.UserCardCredentials", on_delete=models.DO_NOTHING,
                                   related_name='transactions', null=True, blank=True)

    card_pan = models.CharField(max_length=255, null=True, blank=True)

    provider = models.TextField(default=TRANSACTION_PROVIDERS.OTHER, choices=TRANSACTION_PROVIDERS)
    is_test = models.BooleanField(default=False)

    success_at = models.DateTimeField(null=True, blank=True, editable=False)
    refund_at = models.DateTimeField(null=True, blank=True, editable=False)

    created_at = models.DateTimeField(editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    # TODO refactor can_refund, can_sign and can_validate after implementing providers
    @property
    def can_refund(self) -> bool:
        if (self.refund_at or not self.success_at or (
            self.status not in [TRANSACTION_STATUSES.HELD,
                                TRANSACTION_STATUSES.SUCCESS])):
            return False
        else:
            return True

    @property
    def can_validate(self) -> bool:
        if self.refund_at or self.success_at:
            return False
        else:
            return True

    @property
    def can_charge(self) -> bool:
        if self.status != TRANSACTION_STATUSES.CREATED or self.refund_at or self.success_at:
            return False
        else:
            return True

    @property
    def can_hold(self) -> bool:
        return self.can_charge

    @property
    def can_unhold(self) -> bool:
        return self.can_refund

    @property
    def can_settle(self) -> bool:
        return self.status == TRANSACTION_STATUSES.HELD

    def provider_class_instance(self):
        if self.provider in TRANSACTION_HANDLERS:
            return TRANSACTION_HANDLERS.get(self.provider)()
        else:
            raise Exception("Transaction handler is not set")

    def refund(self) -> None:
        if not self.can_refund:
            raise errors.RefundError()

        if not self.is_test:
            provider = self.provider_class_instance()
            provider.refund(self)

    def charge(self) -> dict:
        if not self.can_charge:
            raise errors.ChargeError()

        if not self.is_test:
            provider = self.provider_class_instance()
            return provider.charge(self)

    def validate(self) -> None:
        if not self.can_validate:
            raise errors.ValidateError()

        if not self.is_test:
            self.status = TRANSACTION_STATUSES.SUCCESS
            self.success_at = timezone.now()
            self.save()

    def settle(self) -> None:
        if not self.can_settle:
            raise errors.SettleError()

        if not self.is_test:
            provider = self.provider_class_instance()
            provider.settle(self)

    def hold(self) -> None:
        if not self.can_hold:
            raise errors.HoldError()

        if not self.is_test:
            provider = self.provider_class_instance()
            provider.hold(self)

    def unhold(self) -> None:
        if not self.can_unhold:
            raise errors.RefundError()

        if not self.is_test:
            provider = self.provider_class_instance()
            provider.unhold(self)

    def clean(self) -> None:
        pass

    def save(self, *args, **kwargs) -> None:
        self.is_test = settings.TESTING
        self.created_at = self.created_at if self.created_at else timezone.now()

        self.clean()
        if self._state.adding:
            if get_current_user():
                self.ip_address = get_client_ip(get_current_request())
            else:
                self.ip_address = get_my_ip()

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return (f'{self.__class__.__name__} {self.action} '
                f'{self.amount} {self.currency} '
                f'{self.card_pan} | {self.status}')


class Transaction(AbstractTransaction):
    card_creds = models.ForeignKey("payment.UserCardCredentials", on_delete=models.DO_NOTHING,
                                   related_name='transactions', null=True, blank=True)
    user = models.ForeignKey("user.User", related_name='transactions',
                             on_delete=models.CASCADE)

    class Meta:
        db_table = TRANSACTION_TABLE_NAME
        ordering = ('created_at',)

    def validate(self) -> None:
        if self.can_validate:
            # TODO go to different way of keeping kinds
            if self.kind == RP_TRANSACTION_VERIFICATION:
                self.card_creds.verify()
            elif self.kind == RP_TRANSACTION_SALE:
                self.success_at = timezone.now()
                self.status = TRANSACTION_STATUSES.SUCCESS
                self.save()
            elif self.kind == RP_TRANSACTION_AUTH:
                self.success_at = timezone.now()
                self.status = TRANSACTION_STATUSES.HELD
                self.save()
        else:
            raise errors.ValidateError()


class PTPTransaction(AbstractTransaction):
    card_creds = models.ForeignKey("payment.UserCardCredentials", on_delete=models.DO_NOTHING,
                                   related_name='ptp_transactions')
    beneficiary_card_creds = models.ForeignKey(
        "payment.UserCardCredentials",
        on_delete=models.DO_NOTHING,
        related_name='ptp_transactions_as_beneficiary')

    action = models.TextField(default='P2P_TRANSFER')
    beneficiary_card = models.CharField(max_length=255)

    class Meta:
        db_table = PTP_TRANSACTION_TABLE_NAME
        ordering = ('created_at',)

    def __str__(self) -> str:
        return (f'{self.__class__.__name__} {self.action} '
                f'{self.amount} {self.currency} '
                f'{self.card_pan} to {self.beneficiary_card} '
                f'| {self.status}')

    def validate(self) -> None:
        if self.can_validate:
            if self.kind == RP_TRANSACTION_VERIFICATION:
                self.card_creds.verify()
            elif self.kind in [RP_TRANSACTION_SALE, RP_TRANSACTION_AUTH]:
                self.success_at = timezone.now()
                self.save()
        else:
            raise errors.ValidateError()

    def charge(self) -> None:
        if self.is_test:
            return

        if self.can_charge:
            provider = self.provider_class_instance()
            provider.ptp_transfer(self)
        else:
            raise errors.ChargeError()


class UserCardCredentials(models.Model):
    # This one is not needed with current workflow

    user = models.ForeignKey('user.User', on_delete=models.CASCADE,
                             related_name='card_credentials')
    card_pan = models.CharField(max_length=255, validators=[validate_luhn])
    rec_token = models.CharField(max_length=255, null=True, blank=True)
    card_type = models.CharField(max_length=255, null=True, blank=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    exp_month = models.SmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ]
    )

    exp_year = models.SmallIntegerField(
        validators=[
            MinValueValidator(2020),
            MaxValueValidator(2100)
        ]
    )

    is_verified = models.BooleanField(default=False)
    verified_until = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = USER_CARD_CREDENTIALS_TABLE_NAME
        ordering = ('id',)

    def __str__(self):
        return f'Card credentials for user {self.user}'

    def __repr__(self):
        return f'Card credentials for user {self.user}'

    def init_verification(self, cvv: str):
        from fmm.payment.handlers.razorpay import RazorPayHandler

        handler = RazorPayHandler()

        verification_transaction = Transaction.objects.create(
            kind=RP_TRANSACTION_VERIFICATION,
            card_creds=self,
            card_pan=self.card_pan,
            amount=random.randint(1, 5),
            currency='INR',
            provider=TRANSACTION_PROVIDERS.WAYFORPAY
        )
        return handler.verify(transaction=verification_transaction, cvv=cvv)

    def verify(self):
        self.is_verified = True
        self.verified_until = timezone.now() + timezone.timedelta(days=60)  # TODO decide how long
        self.save()
