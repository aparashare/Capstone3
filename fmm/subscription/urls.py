from rest_framework.routers import SimpleRouter

from fmm.subscription.views import SubscriptionUserViewSet
from fmm.utils.constants.endpoints import SUBSCRIPTION_USERS

router = SimpleRouter()

router.register(SUBSCRIPTION_USERS, SubscriptionUserViewSet, SUBSCRIPTION_USERS)

urlpatterns = router.urls
