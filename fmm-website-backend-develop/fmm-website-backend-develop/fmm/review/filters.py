from fmm.review.models import MentorReview, WorkshopReview
from fmm.utils.BaseFilter import BaseFilter
from fmm.utils.constants.lookups import NUMERIC, TEXT


class MentorReviewFilter(BaseFilter):
    class Meta:
        model = MentorReview
        fields = {
            "id": NUMERIC,
            "user": NUMERIC,
            "mentor": NUMERIC,
            "title": TEXT,
            "content": TEXT,
            "hidden_content": TEXT,
            "mark": NUMERIC
        }


class WorkshopReviewFilter(BaseFilter):
    class Meta:
        model = WorkshopReview
        fields = {
            "id": NUMERIC,
            "user": NUMERIC,
            "workshop": NUMERIC,
            "title": TEXT,
            "content": TEXT,
            "hidden_content": TEXT,
            "mark": NUMERIC
        }
