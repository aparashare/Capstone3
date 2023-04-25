import django_filters
import razorpay
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import CustomGroupPermission, get_required_groups
from fmm.payment.models import Transaction
from fmm.study.filters import (
    AppointmentAssignmentFilter,
    AppointmentAssignmentUserFilter,
    AppointmentFilter,
    AppointmentUserFilter,
    RazorPayPaymentFilter,
    WorkshopAssignmentFilter,
    WorkshopAssignmentUserFilter,
    WorkshopCouponFilter,
    WorkshopFilter,
    WorkshopRecordingFilter,
    WorkshopUserFilter,
)
from fmm.study.models import (
    Appointment,
    AppointmentAssignment,
    AppointmentAssignmentUser,
    AppointmentUser,
    GroupCall,
    RazorPayPayment,
    StudyPayment,
    Workshop,
    WorkshopAssignment,
    WorkshopAssignmentUser,
    WorkshopCoupon,
    WorkshopRecording,
    WorkshopUser,
)
from fmm.study.serializers import (
    AppointmentAssignmentSerializer,
    AppointmentAssignmentUserSerializer,
    AppointmentSerializer,
    AppointmentUserSerializer,
    GroupCallSerializer,
    RazorPayPaymentPublicSerializer,
    RazorPayPaymentSerializer,
    WorkshopAssignmentSerializer,
    WorkshopAssignmentUserSerializer,
    WorkshopCouponSerializer,
    WorkshopPublicSerializer,
    WorkshopRecordingSerializer,
    WorkshopSerializer,
    WorkshopUserPublicSerializer,
    WorkshopUserSerializer,
)
from fmm.user.serializers import UserShortSerializer
from fmm.utils.constants.enums import TRANSACTION_PROVIDERS
from fmm.utils.constants.permissions import (
    APPOINTMENT,
    APPOINTMENT_ASSIGNMENT,
    APPOINTMENT_ASSIGNMENT_USER,
    APPOINTMENT_USER,
    GROUP_CALL,
    WORKSHOP,
    WORKSHOP_ASSIGNMENT,
    WORKSHOP_ASSIGNMENT_USER,
    WORKSHOP_COUPON,
    WORKSHOP_RECORDING,
    WORKSHOP_USER,
)
from fmm.utils.helper import METHOD_GET, METHOD_POST

User = get_user_model()


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

    @action(detail=True,
            methods=[METHOD_GET],
            serializer_class=UserShortSerializer)
    def enrolled_users(self, request, *args, **kwargs):
        workshop = self.get_object()
        owner = request.user
        mentor = workshop.mentor.user

        if owner.pk != mentor.pk:
            return Response([])

        workshops = WorkshopUser.objects.filter(workshop=workshop)
        user_ids = [workshop.user.pk for workshop in workshops]

        enrolled_users = User.objects.filter(pk__in=user_ids)
        context = self.get_serializer_context()

        serializer = UserShortSerializer(enrolled_users, many=True, context=context)
        return Response(serializer.data)


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

    @action(
        detail=True,
        methods=[METHOD_POST],
    )
    def pay(self, request, pk):
        workshop_user = get_object_or_404(klass=WorkshopUser, pk=pk)
        return Response(workshop_user.pay(coupon_code=request.data.get('coupon_code')))


class RazorPayPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = RazorPayPaymentSerializer
    queryset = RazorPayPayment.objects.all()
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    filter_class = RazorPayPaymentFilter
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(WORKSHOP_USER)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return RazorPayPaymentPublicSerializer
        else:
            return RazorPayPaymentSerializer

    def create(self, request, *args, **kwargs):
        razorpay_signature = request.data.get('razorpay_signature')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        user_id = request.data.get("user")
        amount = request.data.get('amount')
        workshop_id = request.data.get('workshop')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))

        data = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        }
        success = False
        try:
            with transaction.atomic():
                client.utility.verify_payment_signature(data)

                workshop = get_object_or_404(Workshop, pk=workshop_id)
                user = get_object_or_404(User, pk=user_id)
                workshop_user = get_object_or_404(WorkshopUser, workshop=workshop, user=user)
                trans = Transaction.objects.filter(
                    user=user,
                    provider=TRANSACTION_PROVIDERS.RAZORPAY,
                    description=workshop.title,
                    currency=workshop.price.currency
                ).first()
                study_payment = StudyPayment.objects.create(
                    workshop_user=workshop_user,
                    transaction=trans
                )
                workshop_user.payment = study_payment
                workshop_user.save()

                success = True
                message = 'Signature Verified Successfully.'

        except razorpay.errors.SignatureVerificationError as e:
            success = False
            message = '{}'.format(e)

        data.update({
            "amount": amount,
            "workshop": workshop_id,
            "user": user_id,
            "status": success,
            "message": message
        })
        serializer = RazorPayPaymentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(data)


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
