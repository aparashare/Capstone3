from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class MultipleForbiddenError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = _('Multiple answers forbidden on this poll')
    default_code = 'answer_creation_failed'


class IncorrectAnswerError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Answer is not present in poll options')
    default_code = 'answer_creation_failed'
