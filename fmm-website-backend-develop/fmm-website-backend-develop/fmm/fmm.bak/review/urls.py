from rest_framework.routers import SimpleRouter

from fmm.review.views import MentorReviewViewSet, WorkshopReviewViewSet
from fmm.utils.constants.endpoints import MENTOR_REVIEWS, WORKSHOP_REVIEWS

router = SimpleRouter()

router.register(MENTOR_REVIEWS, MentorReviewViewSet, MENTOR_REVIEWS)
router.register(WORKSHOP_REVIEWS, WorkshopReviewViewSet, WORKSHOP_REVIEWS)

urlpatterns = router.urls
