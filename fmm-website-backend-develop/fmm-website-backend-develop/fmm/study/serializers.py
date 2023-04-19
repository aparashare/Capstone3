from typing import Optional

from rest_framework import exceptions, serializers

from config.permissions import is_in_group
from fmm.study.models import (
    Appointment,
    AppointmentAssignment,
    AppointmentAssignmentUser,
    AppointmentUser,
    GroupCall,
    RazorPayPayment,
    Workshop,
    WorkshopAssignment,
    WorkshopAssignmentUser,
    WorkshopCoupon,
    WorkshopRecording,
    WorkshopUser,
)
from fmm.user.serializers import UserMentorAccountShortSerializer, UserShortSerializer
from fmm.utils.constants.permissions import GROUP_ADMIN, GROUP_MENTOR
from fmm.utils.global_request import get_current_user


class WorkshopSerializer(serializers.ModelSerializer):
    picture = serializers.CharField(max_length=256, required=True)
    room_id = serializers.CharField(max_length=256, required=True)

    class Meta:
        model = Workshop
        fields = '__all__'

    def create(self, validated_data):
        if validated_data['price'] == 0.0 and \
                not self.context[
                    'request'].user.mentor_account.can_create_free_workshops:
            raise exceptions.ValidationError(
                detail='You can`t create free workshops!')
        return super().create(validated_data)


class GroupCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupCall
        fields = '__all__'


class WorkshopPublicSerializer(serializers.ModelSerializer):
    mentor = UserMentorAccountShortSerializer(read_only=True)
    subscribed = serializers.SerializerMethodField(read_only=True)
    rating = serializers.FloatField(read_only=True)

    group_call = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Workshop
        fields = '__all__'

    def get_subscribed(self, instance):
        return instance.students.count()

    def get_group_call(self, instance: Workshop) -> Optional[dict]:
        user = get_current_user()
        if not user or not instance.group_call:
            return None
        if is_in_group(user, GROUP_MENTOR) or is_in_group(user, GROUP_ADMIN):
            return GroupCallSerializer(instance.group_call).data
        else:
            workshop_users = WorkshopUser.objects.filter(
                workshop=instance,
                user=user)
            if workshop_users.exists() and instance.price == 0.00:
                return GroupCallSerializer(instance.group_call).data

            if workshop_users.exists() and workshop_users.first().is_payed:
                return GroupCallSerializer(instance.group_call).data


class WorkshopAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopAssignment
        fields = '__all__'


class WorkshopRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopRecording
        fields = '__all__'


class WorkshopUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopUser
        fields = '__all__'


class WorkshopUserPublicSerializer(serializers.ModelSerializer):
    workshop = WorkshopPublicSerializer(read_only=True)
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = WorkshopUser
        fields = '__all__'


class WorkshopCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopCoupon
        fields = '__all__'


class WorkshopAssignmentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopAssignmentUser
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'


class AppointmentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentUser
        fields = '__all__'


class AppointmentAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAssignment
        fields = '__all__'


class AppointmentAssignmentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentAssignmentUser
        fields = '__all__'


class RazorPayPaymentPublicSerializer(serializers.ModelSerializer):
    workshop = WorkshopSerializer(read_only=True)
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = RazorPayPayment
        fields = "__all__"


class RazorPayPaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RazorPayPayment
        fields = '__all__'
