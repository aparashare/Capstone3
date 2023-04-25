from django.contrib.auth.models import Group
from rest_framework import serializers

from fmm.user.errors import UserExistsError
from fmm.user.models import (User, UserPersonalInfo, UserSocialInfo,
                             UserMentorAccount, UserEducation, UserExpertise, UserMentorSchedule,
                             UserYuweeAccount)
from fmm.utils.constants.permissions import GROUP_USER
from fmm.utils.randomaizer import random_string

PUBLIC_EXCLUDE_FIELDS = [
    'password',
    'is_staff',
    'is_superuser',
    'is_active',
    'user_permissions'
]


class UserGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = (
            'id',
            'name'
        )


class UserShortSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'avatar',
            'email'
        )

    def get_avatar(self, instance: User):
        return instance.avatar.url if instance.avatar else None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={
                                     "input_type": "password"})

    class Meta:
        model = User
        exclude = [f for f in PUBLIC_EXCLUDE_FIELDS if f != 'password']
        extra_kwargs = {'username': {'required': False},
                        "password": {"write_only": True}}

    def create(self, validated_data):
        if User.objects.filter(email=validated_data.get('email')):
            raise UserExistsError()
        # юзернейм копируется из мейла, потому что такое значение юзернейма
        # нужно для получения токена в /o/token/. Так не делается.
        # Надо переделать. TODO

        username = validated_data.get('username', None)
        email = validated_data.get('email')
        password = validated_data.get('password', '')
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        if not username:
            username = ''.join([validated_data.get('email').split('@')[0],
                                '_', random_string()])

        user: User = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        user_group = Group.objects.get(name=GROUP_USER)
        user_group.user_set.add(user)
        if not validated_data.get('password', ''):
            user.request_password_reset(initial=True)

        return user

    def get_avatar(self, instance: User):
        return instance.avatar.url if instance.avatar else None


class UserPublicSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    groups = UserGroupSerializer(many=True)
    mentor_account = serializers.SerializerMethodField()
    personal_info = serializers.SerializerMethodField()
    educations = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = PUBLIC_EXCLUDE_FIELDS

    def get_avatar(self, instance: User):
        return instance.avatar.url if instance.avatar else None

    def get_mentor_account(self, instance: User):
        try:
            return UserMentorAccountPublicSerializer(instance.mentor_account).data
        except Exception as e:
            print(str(e))
            return None

    def get_personal_info(self, instance: User):
        try:
            return UserPersonalInfoSerializer(instance.personal_info).data
        except Exception as e:
            print(str(e))
            return None

    def get_educations(self, instance: User):
        return UserEducationSerializer(instance.educations, many=True).data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = PUBLIC_EXCLUDE_FIELDS

    def get_avatar(self, instance: User):
        return instance.avatar.url if instance.avatar else None


class UserPersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPersonalInfo
        fields = '__all__'


class UserExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExpertise
        fields = '__all__'


class UserSocialInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSocialInfo
        fields = '__all__'


class UserEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEducation
        fields = '__all__'


class UserMentorAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMentorAccount
        fields = '__all__'


class UserMentorAccountPublicSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)
    expertise = UserExpertiseSerializer(many=True, read_only=True)
    rating = serializers.FloatField(read_only=True)

    class Meta:
        model = UserMentorAccount
        fields = '__all__'


class UserMentorAccountShortSerializer(serializers.ModelSerializer):
    user = UserShortSerializer(read_only=True)

    class Meta:
        model = UserMentorAccount
        fields = (
            'id',
            'user'
        )


class UserMentorScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMentorSchedule
        fields = '__all__'


class UserYuweeAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserYuweeAccount
        fields = '__all__'


class UserShortPublicSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'avatar',
        )

    def get_avatar(self, instance: User):
        return instance.avatar.url if instance.avatar else None


class UserMentorAccountPublicGetSerializer(serializers.ModelSerializer):
    user = UserShortPublicSerializer(read_only=True)
    expertise = UserExpertiseSerializer(many=True, read_only=True)
    rating = serializers.FloatField(read_only=True)

    class Meta:
        model = UserMentorAccount
        exclude = (
            "can_create_free_workshops",
            "checked_by",
            "created_at",
            "updated_at"
        )
