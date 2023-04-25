from fmm.lead.models import LeadUser
from fmm.utils.BaseFilter import BaseFilter
from fmm.utils.constants.lookups import TEXT, NUMERIC


class LeadUserFilter(BaseFilter):
    class Meta:
        model = LeadUser
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'name': TEXT,
            'email': TEXT,
            'phone': TEXT,
            'comment': TEXT
        }
