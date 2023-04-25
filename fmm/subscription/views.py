import django_filters
from rest_framework import viewsets, filters

from config.permissions import get_required_groups, CustomGroupPermission
from fmm.subscription.filters import SubscriptionUserFilter
from fmm.subscription.models import SubscriptionUser
from fmm.subscription.serializers import SubscriptionUserSerializer
from fmm.utils.constants.permissions import SUBSCRIPTION_USER


class SubscriptionUserViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionUserSerializer
    queryset = SubscriptionUser.objects.all()
    filter_class = SubscriptionUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter, filters.SearchFilter)
    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(SUBSCRIPTION_USER)
