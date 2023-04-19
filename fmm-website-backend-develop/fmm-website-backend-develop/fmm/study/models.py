import logging
from datetime import timedelta
from typing import Optional

from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from djmoney.models.fields import MoneyField
from slugify import slugify

from config.permissions import is_in_group
from fmm.payment.models import Transaction
from fmm.utils.constants.constants import (
    ASSIGNMENT_PATH,
    WORKSHOP_PICTURE_PATH,
    WORKSHOP_RECORDING_PATH,
)
from fmm.utils.constants.enums import ASSIGNMENT_STATUSES, TRANSACTION_PROVIDERS
from fmm.utils.constants.permissions import GROUP_ADMIN, GROUP_MENTOR, RAZORPAYPAYMENT
from fmm.utils.constants.table_names import (
    APPOINTMENT,
    APPOINTMENT_ASSIGNMENT,
    APPOINTMENT_ASSIGNMENT_USER,
    APPOINTMENT_USER,
    GROUP_CALL,
    STUDY_PAYMENT,
    WORKSHOP,
    WORKSHOP_ASSIGNMENT,
    WORKSHOP_ASSIGNMENT_USER,
    WORKSHOP_COUPON,
    WORKSHOP_RECORDING,
    WORKSHOP_USER,
)
from fmm.utils.global_request import get_current_user
from fmm.utils.storage import NewFileStorage, OverwriteStorage
from fmm.utils.validators import NotFarFutureValidator, NotPastValidator

logger = logging.getLogger(__name__)


def workshop_picture_upload_path(instance, filename):
    return f'{WORKSHOP_PICTURE_PATH}/{filename}'


def workshop_presentation_upload_path(instance, filename):
    return f'{WORKSHOP_PICTURE_PATH}/{filename}'


def workshop_recording_upload_path(instance, filename):
    return f'{WORKSHOP_RECORDING_PATH}/{filename}'


def assignment_upload_path(instance, filename):
    return f'{ASSIGNMENT_PATH}/{filename}'


class AbstractWorkshop(models.Model):
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)

    picture = models.CharField(max_length=255, blank=True, null=True)

    topics = models.TextField(max_length=2000)

    start_at = models.DateTimeField(
        validators=[
            NotPastValidator(),
            NotFarFutureValidator(timedelta(days=60))
        ]
    )

    end_at = models.DateTimeField(
        validators=[
            NotPastValidator(),
            NotFarFutureValidator(timedelta(days=60))
        ],
        null=True,
        blank=True
    )

    tags = ArrayField(base_field=models.CharField(max_length=255), max_length=10,
                      default=list)

    price = MoneyField(max_digits=10, decimal_places=2, default_currency='INR')

    presentation = models.ImageField(storage=OverwriteStorage(),
                                     upload_to=workshop_presentation_upload_path,
                                     null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.__class__.__name__} {self.title}'


class GroupCall(models.Model):
    passcode = models.CharField(max_length=250)
    token = models.CharField(max_length=250)
    call_id = models.CharField(max_length=250, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = GROUP_CALL
        ordering = ('id',)


class Workshop(AbstractWorkshop):
    group_call = models.OneToOneField('study.GroupCall',
                                      related_name='workshop',
                                      on_delete=models.DO_NOTHING,
                                      null=True, blank=True)

    amount = models.SmallIntegerField(
        validators=[
            MinValueValidator(2),
            MaxValueValidator(100)
        ]
    )

    mentor = models.ForeignKey("user.UserMentorAccount", related_name='workshops',
                               on_delete=models.CASCADE)

    top = models.BooleanField(default=False)
    room_id = models.CharField(max_length=256, null=True, blank=True)

    class Meta:
        db_table = WORKSHOP
        ordering = ('-top', 'created_at')


class Appointment(AbstractWorkshop):
    group_call = models.OneToOneField('study.GroupCall', related_name='appointment',
                                      on_delete=models.DO_NOTHING, null=True, blank=True)

    mentor = models.ForeignKey("user.UserMentorAccount", related_name='appointments',
                               on_delete=models.CASCADE)

    class Meta:
        db_table = APPOINTMENT
        ordering = ('id',)


class WorkshopRecording(models.Model):
    workshop = models.ForeignKey('study.Workshop', related_name='recordings',
                                 on_delete=models.CASCADE)

    description = models.CharField(max_length=2000, null=True, blank=True)

    video = models.FileField(storage=OverwriteStorage(), upload_to=workshop_recording_upload_path)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = WORKSHOP_RECORDING
        ordering = ('id',)


class WorkshopUser(models.Model):
    user = models.ForeignKey('user.User', related_name='workshop_users',
                             on_delete=models.CASCADE)

    workshop = models.ForeignKey('study.Workshop', related_name='students',
                                 on_delete=models.CASCADE)

    # To have statistics which coupons and how many times where used
    coupon = models.ForeignKey('study.WorkshopCoupon', related_name='workshop_users',
                               on_delete=models.DO_NOTHING, null=True, blank=True)

    payment = models.ForeignKey('study.StudyPayment', related_name='workshop_users',
                                null=True, blank=True, on_delete=models.DO_NOTHING)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = WORKSHOP_USER
        ordering = ('id',)
        unique_together = ['user', 'workshop']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def pay(self, coupon_code: Optional[str] = None):
        user = get_current_user()  # current user
        if coupon_code:
            coupon = get_object_or_404(klass=WorkshopCoupon, code=coupon_code)
            final_price = self.workshop.price.amount * (100 - coupon.discount) / 100  # final price
            self.coupon = coupon
        else:
            final_price = self.workshop.price.amount

        transaction = Transaction.objects.create(
            user=user,
            provider=TRANSACTION_PROVIDERS.RAZORPAY,
            description=self.workshop.title,
            amount=final_price,
            currency=self.workshop.price.currency)

        self.save()

        return transaction.charge()

    @property
    def is_payed(self) -> bool:
        return not self.workshop.price or bool(self.payment.transaction.success_at)

    def __str__(self):
        return f'{self.__class__.__name__} user={self.user} workshop=({self.workshop})'


class AppointmentUser(models.Model):
    user = models.ForeignKey('user.User', related_name='appointment_users',
                             on_delete=models.CASCADE)

    appointment = models.OneToOneField('study.Appointment', related_name='student',
                                       on_delete=models.CASCADE)

    payment = models.ForeignKey('study.StudyPayment', related_name='appointment_users',
                                null=True, blank=True, on_delete=models.DO_NOTHING)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = APPOINTMENT_USER
        ordering = ('id',)

    @property
    def is_payed(self) -> bool:
        return not self.appointment.price or bool(self.payment.transaction.success_at)

    # TODO finish payment
    def pay(self):
        pass

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.__class__.__name__} user={self.user} appointment=({self.appointment})'


class StudyPayment(models.Model):
    transaction = models.ForeignKey('payment.Transaction', related_name='study_payments',
                                    on_delete=models.DO_NOTHING)

    workshop_user = models.ForeignKey('study.WorkshopUser', related_name='payments',
                                      on_delete=models.CASCADE, null=True, blank=True)
    appointment_user = models.ForeignKey('study.AppointmentUser', related_name='payments',
                                         on_delete=models.CASCADE, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = STUDY_PAYMENT
        ordering = ('id',)


class WorkshopCoupon(models.Model):
    workshop = models.ForeignKey('study.Workshop', related_name='coupons',
                                 on_delete=models.CASCADE)

    # discount in percents
    discount = models.FloatField(
        validators=[
            MinValueValidator(1.0),
            MaxValueValidator(100.0)
        ]
    )
    code = models.CharField(max_length=255, unique=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = WORKSHOP_COUPON
        ordering = ('id',)

    def __str__(self):
        return f'{self.__class__.__name__} workshop=({self.workshop})'

    def clean(self) -> None:
        if self.workshop.coupons.count() >= 50:
            raise PermissionError("This class has maximum number of coupons already")

        user = get_current_user()
        if self.discount == 100.0 and (not user or not is_in_group(user, GROUP_ADMIN)):
            raise PermissionError("You can not set this coupon to 100%")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class AbstractAssignment(models.Model):

    file = models.FileField(storage=OverwriteStorage(), upload_to=assignment_upload_path)

    finish_till = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self._state.adding and self.file:
            self.file.name = (f'{self.__class__.__name__}_{slugify(str(timezone.now()))}'
                              f'.{self.file.name.split(".")[-1]}')
        super().save(*args, **kwargs)


class AbstractAssignmentUser(models.Model):
    user = models.ForeignKey('user.User', related_name='assignments',
                             on_delete=models.CASCADE)

    assignment = models.ForeignKey('study.AbstractAssignment',
                                   related_name='assignment_users',
                                   on_delete=models.CASCADE)

    status = models.CharField(choices=ASSIGNMENT_STATUSES, default=ASSIGNMENT_STATUSES.IN_PROGRESS,
                              max_length=100)

    solution = models.FileField(storage=NewFileStorage())

    mark = models.FloatField(null=True, blank=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self._state.adding and self.solution:
            self.solution.name = (f'{self.__class__.__name__}_{slugify(str(timezone.now()))}'
                                  f'.{self.solution.name.split(".")[-1]}')
        super().save(*args, **kwargs)

    def evaluate(self, mark):
        user = get_current_user()
        if is_in_group(user, GROUP_MENTOR) or is_in_group(user, GROUP_MENTOR):
            self.mark = mark
            self.status = ASSIGNMENT_STATUSES.EVALUATED
            self.save()
        else:
            raise PermissionError("You can not evaluate this assignment")

    def finish(self):
        user = get_current_user()
        if not (self.user == user or is_in_group(user, GROUP_ADMIN)):
            raise PermissionError("You can not finish this assignment")

        if self.assignment.finish_till < timezone.now():
            raise PermissionError("This assignment due date is in the past")
        self.status = ASSIGNMENT_STATUSES.WAITING_EVALUATION
        self.save()


class WorkshopAssignment(AbstractAssignment):
    workshop = models.ForeignKey('study.Workshop', related_name='assignments',
                                 on_delete=models.CASCADE)

    class Meta:
        db_table = WORKSHOP_ASSIGNMENT
        ordering = ('id',)

    def launch_on_users(self):
        for student in self.workshop.students:
            try:
                WorkshopAssignmentUser.objects.create(
                    user=student.user,
                    workshop_assignment=self)
            except Exception as e:
                logger.warning(str(e))


class WorkshopAssignmentUser(AbstractAssignmentUser):
    user = models.ForeignKey('user.User', related_name='workshop_assignments',
                             on_delete=models.CASCADE)

    assignment = models.ForeignKey('study.WorkshopAssignment',
                                   related_name='assignment_users',
                                   on_delete=models.CASCADE)

    class Meta:
        db_table = WORKSHOP_ASSIGNMENT_USER
        ordering = ('id',)

    def __str__(self):
        return f'{self.__class__.__name__} assignment=({self.assignment}) user={self.user}'


class AppointmentAssignment(AbstractAssignment):
    appointment = models.ForeignKey('study.Appointment', related_name='assignments',
                                    on_delete=models.CASCADE)

    class Meta:
        db_table = APPOINTMENT_ASSIGNMENT
        ordering = ('id',)


class AppointmentAssignmentUser(AbstractAssignmentUser):
    user = models.ForeignKey('user.User', related_name='appointment_assignments',
                             on_delete=models.CASCADE)

    assignment = models.ForeignKey('study.AppointmentAssignment',
                                   related_name='assignment_users',
                                   on_delete=models.CASCADE)

    class Meta:
        db_table = APPOINTMENT_ASSIGNMENT_USER
        ordering = ('id',)

    def __str__(self):
        return (f'{self.__class__.__name__} '
                f'assignment=({self.assignment}) user={self.user}')


class RazorPayPayment(models.Model):
    user = models.ForeignKey(
        'user.User',
        related_name='razor_pay_payments',
        on_delete=models.CASCADE
    )
    razorpay_signature = models.CharField(max_length=225)
    razorpay_payment_id = models.CharField(max_length=225)
    razorpay_order_id = models.CharField(max_length=225)
    amount = models.DecimalField(max_digits=9, decimal_places=4)
    workshop = models.ForeignKey(
        'study.Workshop',
        related_name='razor_pay_payments',
        on_delete=models.CASCADE
    )
    status = models.BooleanField(default=False)

    class Meta:
        db_table = RAZORPAYPAYMENT
        ordering = ('id', )

    def __str__(self):
        return (f'{self.__class__.__name__} '
                f'razorpay_order_id=({self.razorpay_order_id}) user={self.user}')
