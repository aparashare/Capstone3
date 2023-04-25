from fmm.subscription.models import SubscriptionUser
from fmm.utils.BaseFilter import BaseFilter
from fmm.utils.constants.lookups import TEXT, NUMERIC


class SubscriptionUserFilter(BaseFilter):
    class Meta:
        model = SubscriptionUser
        fields = {
            'id': NUMERIC,
            'email': TEXT
        }
