from rest_framework.routers import SimpleRouter

from fmm.lead.views import LeadUserViewSet
from fmm.utils.constants.endpoints import LEAD_USERS

router = SimpleRouter()

router.register(LEAD_USERS, LeadUserViewSet, LEAD_USERS)

urlpatterns = router.urls
