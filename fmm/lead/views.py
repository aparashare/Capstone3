import django_filters
from rest_framework import viewsets, filters

from config.permissions import CustomGroupPermission, get_required_groups
from fmm.lead.filters import LeadUserFilter
from fmm.lead.models import LeadUser
from fmm.lead.serializers import LeadUserSerializer
from fmm.utils.constants.permissions import LEAD_USER


class LeadUserViewSet(viewsets.ModelViewSet):
    serializer_class = LeadUserSerializer
    queryset = LeadUser.objects.all()
    filter_class = LeadUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter, filters.SearchFilter)
    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(LEAD_USER)
