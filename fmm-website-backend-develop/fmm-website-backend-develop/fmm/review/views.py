import django_filters
from rest_framework import viewsets, permissions, filters

from config.permissions import is_in_group, CustomGroupPermission, get_required_groups
from fmm.review.filters import MentorReviewFilter, WorkshopReviewFilter
from fmm.review.models import MentorReview, WorkshopReview
from fmm.review.serializers import (MentorPublicReviewSerializer, MentorAdminReviewSerializer,
                                    WorkshopPublicReviewSerializer, WorkshopAdminReviewSerializer)
from fmm.utils.constants.permissions import GROUP_ADMIN
from fmm.utils.constants.permissions import MENTOR_REVIEW, WORKSHOP_REVIEW


class MentorReviewViewSet(viewsets.ModelViewSet):
    queryset = MentorReview.objects.all()
    filter_class = MentorReviewFilter
    serializer_class = MentorPublicReviewSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(MENTOR_REVIEW)

    def get_serializer_class(self):
        if is_in_group(self.request.user, GROUP_ADMIN):
            return MentorAdminReviewSerializer
        else:
            return MentorPublicReviewSerializer


class WorkshopReviewViewSet(viewsets.ModelViewSet):
    queryset = WorkshopReview.objects.all()
    filter_class = WorkshopReviewFilter
    serializer_class = WorkshopPublicReviewSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_REVIEW)

    def get_serializer_class(self):
        if is_in_group(self.request.user, GROUP_ADMIN):
            return WorkshopAdminReviewSerializer
        else:
            return WorkshopPublicReviewSerializer
