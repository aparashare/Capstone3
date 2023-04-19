from django_filters import NumberFilter

from fmm.study.models import (WorkshopAssignmentUser, WorkshopAssignment, Workshop,
                              WorkshopCoupon, WorkshopUser, Appointment, AppointmentAssignment,
                              AppointmentAssignmentUser, AppointmentUser, WorkshopRecording)
from fmm.utils.BaseFilter import BaseFilter, CharArrayFilter
from fmm.utils.constants.lookups import TEXT, DATETIME, NUMERIC


class WorkshopFilter(BaseFilter):
    tags__contains = CharArrayFilter(
        field_name='tags', lookup_expr='contains')
    tags__overlap = CharArrayFilter(
        field_name='tags', lookup_expr='overlap')

    rating__gte = NumberFilter(field_name="rating", lookup_expr='gte')
    rating__lte = NumberFilter(field_name="rating", lookup_expr='lte')

    class Meta:
        model = Workshop
        fields = {
            'id': NUMERIC,
            'title': TEXT,
            'mentor': NUMERIC,
            'subject': TEXT,
            'topics': TEXT,
            'start_at': DATETIME,
            'amount': NUMERIC,
            'price': NUMERIC,
        }


class WorkshopAssignmentFilter(BaseFilter):
    class Meta:
        model = WorkshopAssignment
        fields = {
            'id': NUMERIC,
            'workshop': NUMERIC,
            'finish_till': NUMERIC,
        }


class WorkshopRecordingFilter(BaseFilter):
    class Meta:
        model = WorkshopRecording
        fields = {
            'id': NUMERIC,
            'workshop': NUMERIC,
            'description': TEXT,
        }


class WorkshopUserFilter(BaseFilter):
    class Meta:
        model = WorkshopUser
        fields = {
            'id': NUMERIC,
            'workshop': NUMERIC,
            'user': NUMERIC,
            'coupon': NUMERIC
        }


class WorkshopCouponFilter(BaseFilter):
    class Meta:
        model = WorkshopCoupon
        fields = {
            'id': NUMERIC,
            'workshop': NUMERIC,
            'discount': NUMERIC,
            'code': TEXT
        }


class WorkshopAssignmentUserFilter(BaseFilter):
    class Meta:
        model = WorkshopAssignmentUser
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'assignment': NUMERIC,
            'status': TEXT,
            'mark': NUMERIC
        }


class AppointmentFilter(BaseFilter):
    tags__contains = CharArrayFilter(
        field_name='tags', lookup_expr='contains')
    tags__overlap = CharArrayFilter(
        field_name='tags', lookup_expr='overlap')

    class Meta:
        model = Appointment
        fields = {
            'id': NUMERIC,
            'title': TEXT,
            'subject': TEXT,
            'topics': TEXT,
            'start_at': DATETIME,
            'price': NUMERIC,
        }


class AppointmentUserFilter(BaseFilter):
    class Meta:
        model = AppointmentUser
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'appointment': NUMERIC
        }


class AppointmentAssignmentFilter(BaseFilter):
    class Meta:
        model = AppointmentAssignment
        fields = {
            'id': NUMERIC,
            'appointment': NUMERIC,
            'finish_till': NUMERIC,
        }


class AppointmentAssignmentUserFilter(BaseFilter):
    class Meta:
        model = AppointmentAssignmentUser
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'assignment': NUMERIC,
            'status': TEXT,
            'mark': NUMERIC
        }
