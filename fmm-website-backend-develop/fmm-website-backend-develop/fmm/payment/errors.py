from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class SigningError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not sign transaction with provided data.')
    default_code = 'signing_failed'


class RefundError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not refund transaction')
    default_code = 'refund_failed'


class ValidateError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not validate transaction')
    default_code = 'validation_failed'


class ChargeError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not charge transaction')
    default_code = 'charge_failed'


class HoldError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not hold transaction')
    default_code = 'hold_failed'


class SettleError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not settle transaction')
    default_code = 'settle_failed'
