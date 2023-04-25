import django_filters
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import CustomGroupPermission, get_required_groups
from fmm.study.filters import (AppointmentAssignmentFilter, AppointmentFilter,
                               WorkshopAssignmentFilter, WorkshopCouponFilter,
                               WorkshopFilter, AppointmentAssignmentUserFilter,
                               AppointmentUserFilter, WorkshopAssignmentUserFilter,
                               WorkshopUserFilter, WorkshopRecordingFilter)
from fmm.study.models import (WorkshopAssignmentUser, WorkshopAssignment, Workshop,
                              WorkshopCoupon, WorkshopUser, Appointment, AppointmentAssignment,
                              AppointmentAssignmentUser, AppointmentUser, WorkshopRecording,
                              GroupCall)
from fmm.study.serializers import (AppointmentAssignmentSerializer, AppointmentSerializer,
                                   WorkshopAssignmentSerializer, WorkshopCouponSerializer,
                                   WorkshopSerializer, AppointmentAssignmentUserSerializer,
                                   AppointmentUserSerializer, WorkshopAssignmentUserSerializer,
                                   WorkshopUserSerializer, WorkshopRecordingSerializer,
                                   WorkshopUserPublicSerializer, WorkshopPublicSerializer,
                                   GroupCallSerializer)
from fmm.utils.constants.permissions import (WORKSHOP, WORKSHOP_ASSIGNMENT_USER,
                                             WORKSHOP_ASSIGNMENT, WORKSHOP_USER, WORKSHOP_COUPON,
                                             WORKSHOP_RECORDING, APPOINTMENT_USER, APPOINTMENT,
                                             APPOINTMENT_ASSIGNMENT_USER, APPOINTMENT_ASSIGNMENT,
                                             GROUP_CALL)
from fmm.utils.helper import METHOD_POST, METHOD_GET


class WorkshopViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopSerializer
    queryset = Workshop.objects.all()
    filter_class = WorkshopFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter, filters.SearchFilter)
    search_fields = ['title', 'subject', 'topics']
    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return WorkshopPublicSerializer
        else:
            return WorkshopSerializer

    def get_queryset(self):
        return super().get_queryset().annotate(rating=Avg('workshop_reviews__mark'))

    @action(detail=True,
            methods=[METHOD_GET])
    def payed_users(self, request, pk):
        workshop = get_object_or_404(klass=Workshop, pk=pk)

        if workshop.price and workshop.price.amount:
            workshop_users = WorkshopUser.objects.filter(
                workshop=workshop,
                payment__transaction__success_at__isnull=False,
                payment__transaction__refund_at__isnull=True)
        else:
            workshop_users = workshop.students
        return Response(WorkshopUserPublicSerializer(workshop_users, many=True).data)


class GroupCallViewSet(viewsets.ModelViewSet):
    serializer_class = GroupCallSerializer
    queryset = GroupCall.objects.all()

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter, filters.SearchFilter)
    permission_classes = [
        CustomGroupPermission,
        permissions.IsAuthenticated
    ]
    required_groups = get_required_groups(GROUP_CALL)


class WorkshopRecordingViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopRecordingSerializer
    queryset = WorkshopRecording.objects.all()
    filter_class = WorkshopRecordingFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_RECORDING)


class WorkshopUserViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopUserSerializer
    queryset = WorkshopUser.objects.all()
    filter_class = WorkshopUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_USER)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return WorkshopUserPublicSerializer
        else:
            return WorkshopUserSerializer

    @action(detail=True,
            methods=[METHOD_POST])
    def pay(self, request, pk):
        workshop_user = get_object_or_404(klass=WorkshopUser, pk=pk)
        return Response(workshop_user.pay(coupon_code=request.data.get('coupon_code')))


class WorkshopCouponViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopCouponSerializer
    queryset = WorkshopCoupon.objects.all()
    filter_class = WorkshopCouponFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_COUPON)


class WorkshopAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopAssignmentSerializer
    queryset = WorkshopAssignment.objects.all()
    filter_class = WorkshopAssignmentFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_ASSIGNMENT)

    @action(detail=True,
            methods=[METHOD_POST])
    def launch_on_users(self, request, pk):
        assignment_user: WorkshopAssignment = get_object_or_404(
            klass=WorkshopAssignment,
            pk=pk)

        assignment_user.launch_on_users()
        return Response(WorkshopAssignmentSerializer(assignment_user).data)


class WorkshopAssignmentUserViewSet(viewsets.ModelViewSet):
    serializer_class = WorkshopAssignmentUserSerializer
    queryset = WorkshopAssignmentUser.objects.all()
    filter_class = WorkshopAssignmentUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_ASSIGNMENT_USER)

    @action(detail=True,
            methods=[METHOD_POST])
    def evaluate(self, request, pk):
        assignment_user: WorkshopAssignmentUser = get_object_or_404(
            klass=WorkshopAssignmentUser,
            pk=pk)

        assignment_user.evaluate(mark=float(request.data.get('mark')))
        return Response(WorkshopAssignmentUserSerializer(assignment_user).data)

    @action(detail=True,
            methods=[METHOD_POST])
    def finish(self, request, pk):
        assignment_user: WorkshopAssignmentUser = get_object_or_404(
            klass=WorkshopAssignmentUser,
            pk=pk)

        assignment_user.finish()
        return Response(WorkshopAssignmentUserSerializer(assignment_user).data)


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()
    filter_class = AppointmentFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(APPOINTMENT)


class AppointmentUserViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentUserSerializer
    queryset = AppointmentUser.objects.all()
    filter_class = AppointmentUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(APPOINTMENT_USER)


class AppointmentAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentAssignmentSerializer
    queryset = AppointmentAssignment.objects.all()
    filter_class = AppointmentAssignmentFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(APPOINTMENT_ASSIGNMENT)


class AppointmentAssignmentUserViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentAssignmentUserSerializer
    queryset = AppointmentAssignmentUser.objects.all()
    filter_class = AppointmentAssignmentUserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(APPOINTMENT_ASSIGNMENT_USER)

    @action(detail=True,
            methods=[METHOD_POST])
    def evaluate(self, request, pk):
        assignment_user: AppointmentAssignmentUser = get_object_or_404(
            klass=AppointmentAssignmentUser,
            pk=pk)

        assignment_user.evaluate(mark=float(request.data.get('mark')))
        return Response(AppointmentAssignmentUserSerializer(assignment_user).data)

    @action(detail=True,
            methods=[METHOD_POST])
    def finish(self, request, pk):
        assignment_user: AppointmentAssignmentUser = get_object_or_404(
            klass=AppointmentAssignmentUser,
            pk=pk)

        assignment_user.finish()
        return Response(AppointmentAssignmentUserSerializer(assignment_user).data)
