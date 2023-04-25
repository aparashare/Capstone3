import django_filters
from django.db.models import F, Func
from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from config.permissions import CustomGroupPermission, get_required_groups
from fmm.user.filters import (UserFilter, UserPersonalInfoFilter, UserSocialInfoFilter,
                              UserEducationFilter, UserMentorAccountFilter, UserExpertiseFilter,
                              UserMentorScheduleFilter)
from fmm.user.models import (User, UserPersonalInfo, UserSocialInfo, UserExpertise,
                             UserEducation, UserMentorAccount, UserMentorSchedule, UserYuweeAccount)
from fmm.user.serializers import (UserRegistrationSerializer, UserPersonalInfoSerializer,
                                  UserSerializer, UserSocialInfoSerializer, UserEducationSerializer,
                                  UserMentorScheduleSerializer, UserPublicSerializer,
                                  UserMentorAccountSerializer, UserExpertiseSerializer,
                                  UserMentorAccountPublicSerializer, UserYuweeAccountSerializer)
from fmm.utils.constants.permissions import (USER, USER_PERSONAL_INFO, USER_SOCIAL_INFO,
                                             USER_EDUCATION, USER_EXPERTISE, USER_MENTOR_ACCOUNT,
                                             USER_MENTOR_SCHEDULE)
from fmm.utils.helper import METHOD_POST, METHOD_GET
from fmm.utils.yuwee import YuweeHelper


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    filter_class = UserFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER)

    def get_serializer_class(self):
        if self.request.method == METHOD_GET:
            return UserPublicSerializer
        else:
            return UserSerializer

    @action(detail=False,
            methods=[METHOD_POST],
            permission_classes=[permissions.AllowAny])
    def register(self, request):
        serialized = UserRegistrationSerializer(data=request.data)
        serialized.is_valid(True)
        user: User = serialized.create(serialized.validated_data)
        return Response(UserRegistrationSerializer(user).data)

    @action(detail=True,
            methods=[METHOD_POST])
    def yuwee_register(self, request, pk):
        user: User = get_object_or_404(klass=User, pk=pk)
        helper = YuweeHelper()
        helper.register_user(user=user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False,
            methods=[METHOD_GET],
            permission_classes=[permissions.IsAuthenticated])
    def self(self, request):
        return Response(UserPublicSerializer(request.user).data)

    @action(detail=False,
            methods=[METHOD_GET],
            url_path='self/yuwee')
    def self_yuwee(self, request):
        try:
            return Response(UserYuweeAccountSerializer(request.user.yuwee_account).data)
        except UserYuweeAccount.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False,
            methods=[METHOD_GET])
    def password_recover(self, request):
        user: User = get_object_or_404(klass=User, email=request.query_params.get('email'))
        user.request_password_reset()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserPersonalInfoViewSet(viewsets.ModelViewSet):
    serializer_class = UserPersonalInfoSerializer
    queryset = UserPersonalInfo.objects.all()
    filter_class = UserPersonalInfoFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_PERSONAL_INFO)


class UserSocialInfoViewSet(viewsets.ModelViewSet):
    serializer_class = UserSocialInfoSerializer
    queryset = UserSocialInfo.objects.all()
    filter_class = UserSocialInfoFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_SOCIAL_INFO)


class UserEducationViewSet(viewsets.ModelViewSet):
    serializer_class = UserEducationSerializer
    queryset = UserEducation.objects.all()
    filter_class = UserEducationFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_EDUCATION)

    @action(detail=False,
            methods=[METHOD_GET])
    def all_schools(self, request):
        schools = UserEducation.objects.order_by().values_list('school_name', flat=True).distinct()

        return Response(list(schools))


class UserExpertiseViewSet(viewsets.ModelViewSet):
    serializer_class = UserExpertiseSerializer
    queryset = UserExpertise.objects.all()
    filter_class = UserExpertiseFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_EXPERTISE)

    @action(detail=False,
            methods=[METHOD_GET])
    def all_expertises(self, request):
        res = UserExpertise.objects.values('title').distinct()
        return Response(set([x.get('title') for x in res]))


class UserMentorScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = UserMentorScheduleSerializer
    queryset = UserMentorSchedule.objects.all()
    filter_class = UserMentorScheduleFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_MENTOR_SCHEDULE)
    # TODO restrict delete and create actions


class UserMentorAccountViewSet(viewsets.ModelViewSet):
    serializer_class = UserMentorAccountSerializer
    queryset = UserMentorAccount.objects.all()
    filter_class = UserMentorAccountFilter

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter, filters.SearchFilter)
    search_fields = ['tags', 'expertise__title']
    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(USER_MENTOR_ACCOUNT)

    def get_queryset(self):
        return super().get_queryset().annotate(rating=Avg('mentor_reviews__mark'))

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return UserMentorAccountPublicSerializer
        else:
            return UserMentorAccountSerializer

    @action(detail=False,
            methods=[METHOD_GET])
    def all_tags(self, request):
        tags = (UserMentorAccount.objects
                .annotate(arr_els=Func(F('tags'), function='unnest'))
                .values_list('arr_els', flat=True).distinct())

        return Response(tags)

    @action(detail=True,
            methods=[METHOD_GET])
    def revenue(self, request, pk):
        mentor = get_object_or_404(klass=UserMentorAccount, pk=pk)
        return Response(mentor.revenue)
