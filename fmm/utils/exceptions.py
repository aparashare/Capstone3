from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class YuweeUserExistsError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = _('Yuwee User exist!')
    default_code = 'user_creation_failed'
