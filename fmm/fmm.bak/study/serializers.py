from typing import Optional

from rest_framework import serializers

from fmm.user.serializers import UserMentorAccountShortSerializer, UserShortSerializer
from fmm.study.models import (WorkshopAssignmentUser, WorkshopAssignment, Workshop,
                              WorkshopCoupon, WorkshopUser, Appointment, AppointmentAssignment,
                              AppointmentAssignmentUser, AppointmentUser, WorkshopRecording,
                              GroupCall)
from fmm.utils.constants.permissions import GROUP_MENTOR, GROUP_ADMIN
from fmm.utils.global_request import get_current_user
from config.permissions import is_in_group


class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = '__all__'


class GroupCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupCall
        fields = '__all__'


class WorkshopPublicSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField(read_only=True)
    mentor = UserMentorAccountShortSerializer(read_only=True)
    subscribed = serializers.SerializerMethodField(read_only=True)
    rating = serializers.FloatField(read_only=True)

    group_call = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Workshop
        fields = '__all__'

    def get_picture(self, instance):
        return instance.picture.url

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
