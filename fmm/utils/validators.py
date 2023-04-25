from django.core.validators import BaseValidator
from django.utils import timezone

from fmm.utils.helper import calculate_current_age


class MinAgeValidator(BaseValidator):

    def compare(self, a, b) -> bool:
        return calculate_current_age(a) <= b


class MaxAgeValidator(BaseValidator):

    def compare(self, a, b) -> bool:
        return calculate_current_age(a) >= b


class NotFutureValidator(BaseValidator):

    def __init__(self, limit_value=None, message=None):
        super().__init__(limit_value, message)

    def compare(self, a, b) -> bool:
        return a <= timezone.now()


class NotPastValidator(BaseValidator):

    def __init__(self, limit_value=None, message=None):
        super().__init__(limit_value, message)

    def compare(self, a, b) -> bool:
        return a <= timezone.now()


class NotFarFutureValidator(BaseValidator):

    def compare(self, a, b) -> bool:
        return a - timezone.now() >= self.limit_value
