import base64
from typing import TYPE_CHECKING, Type

import razorpay
from django.conf import settings

from fmm.payment.handlers.abstract_handler import AbstractTransactionHandler

if TYPE_CHECKING:
    from fmm.payment.models import Transaction, PTPTransaction, AbstractTransaction


class RazorPayHandler(AbstractTransactionHandler):
    API_URL = 'https://api.razorpay.com/v1'
    CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
    ORDERS_URL = f'{API_URL}/orders'

    def __init__(self):
        super().__init__()
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))

    @property
    def _headers(self) -> dict:
        def _b64_token() -> str:
            return base64.b64encode(
                f'{settings.RAZORPAY_KEY}:{settings.RAZORPAY_SECRET}'.encode('ascii'))

        return {
            'Authorization': f'Base {_b64_token()}'
        }

    def delete_associated_instances(self, transaction: 'AbstractTransaction') -> None:
        from fmm.study.models import StudyPayment

        if StudyPayment.objects.filter(transaction=transaction).exists():
            payment: StudyPayment = StudyPayment.objects.get(transaction=transaction)
            if payment.workshop_user:
                payment.workshop_user.delete()
            if payment.appointment_user:
                payment.appointment_user.delete()
            payment.delete()

    def handle_incoming_request(self, request, transaction: 'AbstractTransaction') -> (bool, dict):
        data: dict = request.data
        resp = dict()
        if "error" in data:
            check = False
            resp.update({"error": data.get("error")})
            self.delete_associated_instances(transaction)
        else:
            check = self.client.utility.verify_payment_signature(
                {
                    'razorpay_order_id': data.get('razorpay_order_id'),
                    'razorpay_payment_id': data.get('razorpay_payment_id'),
                    'razorpay_signature': data.get('razorpay_signature')
                })

        if check:
            transaction.validate()

        return check, resp

    def verify(self, transaction: 'Transaction', cvv: str):
        """
        Starts verification process of users card credentials.
        """
        pass

    def ptp_transfer(self, transaction: 'PTPTransaction') -> bool:
        """
        Transfer money directly from one card to another.
        """
        pass

    def charge(self, transaction: 'Transaction') -> dict:
        """
        Creates an order to charge from user
        """
        data = {
            'amount': int(transaction.amount * 100),
            'currency': str(transaction.currency),
            'receipt': str(transaction.uid),
            'payment_capture': 1
        }

        order = self.client.order.create(data=data)

        transaction.order_id = order.get('id')
        transaction.save()

        return {
            'src': self.CHECKOUT_URL,
            'data_key': settings.RAZORPAY_KEY,
            'data_amount': float(transaction.amount * 100),
            'data_currency': str(transaction.currency),
            'data_order_id': transaction.order_id,
            'data_buttontext': "Pay with Razorpay",
            'data_name': "FindMeMentor",
            'data_description': transaction.description,
            'data_image': "https://findmementor.com/assets/images/small-logo.png",
            'data_prefill_name': f'{transaction.user.first_name} {transaction.user.last_name}',
            'data_prefill_email': transaction.user.email,
            'data_prefill_contact': transaction.user.personal_info.phone,
            'data_theme_color': "#c98714",
        }

    def refund(self, transaction: 'Type[AbstractTransaction]') -> bool:
        """
        Refunds or declines transaction. Depends on it state.
        """
        pass

    def hold(self, transaction: 'Transaction') -> bool:
        """
        Holds money on users account with timeout up to 20 days.
        """
        pass

    def settle(self, transaction: 'Transaction') -> bool:
        """
        Charges money from users account that were held before.
        """
        pass

    def unhold(self, transaction: 'Transaction') -> bool:
        """
        Declines hold on users account.
        """
        pass
