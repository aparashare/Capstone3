from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import APIException


class UserExistsError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = _('Could not create user with provided data.')
    default_code = 'user_creation_failed'
