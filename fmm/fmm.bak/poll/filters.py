from fmm.poll.models import PollAnswer, Poll
from fmm.utils.BaseFilter import BaseFilter, CharArrayFilter
from fmm.utils.constants.lookups import TEXT, NUMERIC, BOOL


class PollFilter(BaseFilter):
    options__contains = CharArrayFilter(
        field_name='options', lookup_expr='contains')
    options__overlap = CharArrayFilter(
        field_name='options', lookup_expr='overlap')

    class Meta:
        model = Poll
        fields = {
            'id': NUMERIC,
            'question': TEXT,
            'workshop': NUMERIC,
            'appointment': NUMERIC,
            'allow_multiple': BOOL
        }


class PollAnswerFilter(BaseFilter):
    class Meta:
        model = PollAnswer
        fields = {
            'id': NUMERIC,
            'poll': NUMERIC,
            'user': NUMERIC,
            'answer': TEXT
        }
