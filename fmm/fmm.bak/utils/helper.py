import logging
import os
import random
import string
from datetime import date
from functools import reduce
from typing import Optional

from django.core.exceptions import ValidationError

METHOD_SAFE = 'SAFE_METHOD'  # Safe methods [GET, HEAD, OPTIONS]
METHOD_GET = 'GET'
METHOD_POST = 'POST'
METHOD_PUT = 'PUT'
METHOD_PATCH = 'PATCH'
METHOD_DELETE = 'DELETE'

logger = logging.getLogger(__name__)


def gen_random_password(length: int = 16) -> str:
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join([random.choice(letters_and_digits) for _ in range(length)])


def check_luhn(card_pan: str) -> bool:
    """
    Checks if given card number is valid by Luhn Algorithm
    """
    odd_lookup = (0, 2, 4, 6, 8, 1, 3, 5, 7, 9)
    code = reduce(str.__add__, filter(str.isdigit, card_pan))
    evens = sum(int(i) for i in code[-1::-2])
    odds = sum(odd_lookup[int(i)] for i in code[-2::-2])
    return (evens + odds) % 10 == 0


def validate_luhn(card_pan: str):
    """
    Custom validation method for field with card number
    :param card_pan: card number
    :return:
    """
    if not all([c in string.digits for c in card_pan]):
        raise ValidationError('Card number should contain only digits')
    if not check_luhn(card_pan):
        raise ValidationError('Card number is invalid')


def get_my_ip() -> str:
    return os.popen('curl -s ifconfig.me').readline()


def get_client_ip(request) -> Optional[str]:
    """
    Returns an ip extracted from request. Returns None if an error was raised
    """

    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    except Exception as e:
        logger.warning(str(e))
        return None


def calculate_current_age(born: date) -> int:
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


def gen_random_string(length=10) -> str:
    return ''.join(random.choices(string.ascii_letters, k=length))
