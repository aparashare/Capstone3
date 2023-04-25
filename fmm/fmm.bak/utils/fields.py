from model_utils import Choices

from django.db import models

DAY_OF_THE_WEEK = Choices(
    ('MONDAY', 'Monday'),
    ('TUESDAY', 'Tuesday'),
    ('WEDNESDAY', 'Wednesday'),
    ('THURSDAY', 'Thursday'),
    ('FRIDAY', 'Friday'),
    ('SATURDAY', 'Saturday'),
    ('SUNDAY', 'Sunday'),
)


class DayOfTheWeekField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['choices'] = DAY_OF_THE_WEEK
        kwargs['max_length'] = 25
        super(DayOfTheWeekField, self).__init__(*args, **kwargs)
