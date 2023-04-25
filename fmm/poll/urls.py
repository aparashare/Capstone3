from rest_framework.routers import SimpleRouter
from fmm.poll.views import PollAnswerViewSet, PollViewSet
from fmm.utils.constants.endpoints import POLLS, POLL_ANSWERS

router = SimpleRouter()

router.register(POLLS, PollViewSet, POLLS)
router.register(POLL_ANSWERS, PollAnswerViewSet, POLL_ANSWERS)

urlpatterns = router.urls
