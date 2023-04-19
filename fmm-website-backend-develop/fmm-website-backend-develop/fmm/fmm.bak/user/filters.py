from django_filters import NumberFilter

from fmm.user.models import (UserSocialInfo, User, UserPersonalInfo,
                             UserMentorAccount, UserEducation, UserExpertise, UserMentorSchedule)
from fmm.utils.BaseFilter import BaseFilter, CharArrayFilter
from fmm.utils.constants.lookups import DATETIME, NUMERIC, TEXT, BOOL


class UserFilter(BaseFilter):
    class Meta:
        model = User
        fields = {
            'id': NUMERIC,
            'is_active': BOOL,
            'is_superuser': BOOL,
            'username': TEXT,
            'first_name': TEXT,
            'last_name': TEXT,
            'email': TEXT,
            'social_info': NUMERIC,
            'personal_info': NUMERIC,
            'is_staff': BOOL,
            'date_joined': DATETIME,
        }


class UserPersonalInfoFilter(BaseFilter):
    class Meta:
        model = UserPersonalInfo
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'phone': TEXT,
            'gender': TEXT,
            'birthday': DATETIME,
            'country_of_origin': TEXT,
            'city': TEXT,
            'profession': TEXT,
            'about': TEXT,
            'preferences': TEXT
        }


class UserSocialInfoFilter(BaseFilter):
    class Meta:
        model = UserSocialInfo
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'linkedin': TEXT,
            'facebook': TEXT
        }


class UserEducationFilter(BaseFilter):

    class Meta:
        model = UserEducation
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'school_name': TEXT,
            'school_start': DATETIME,
            'school_end': DATETIME,
        }


class UserMentorAccountFilter(BaseFilter):
    tags__contains = CharArrayFilter(
        field_name='tags', lookup_expr='contains', distinct=True)
    tags__overlap = CharArrayFilter(
        field_name='tags', lookup_expr='overlap', distinct=True)

    achievements__contains = CharArrayFilter(
        field_name='achievements', lookup_expr='contains', distinct=True)
    achievements__overlap = CharArrayFilter(
        field_name='achievements', lookup_expr='overlap', distinct=True)

    rating__gte = NumberFilter(field_name="rating", lookup_expr='gte')
    rating__lte = NumberFilter(field_name="rating", lookup_expr='lte')

    class Meta:
        model = UserMentorAccount
        fields = {
            'id': NUMERIC,
            'user': NUMERIC,
            'user__personal_info__gender': TEXT,
            'user__personal_info__city': TEXT,
            'user__personal_info__country_of_origin': TEXT,
            'expertise__title': TEXT,
            'years_of_experience': NUMERIC,
            'about_expertise': TEXT,
            'half_charge': NUMERIC,
            'full_charge': NUMERIC
        }


class UserExpertiseFilter(BaseFilter):
    class Meta:
        model = UserExpertise
        fields = {
            'id': NUMERIC,
            'title': TEXT
        }


class UserMentorScheduleFilter(BaseFilter):
    class Meta:
        model = UserMentorSchedule
        fields = {
            'id': NUMERIC,
            'mentor': NUMERIC,
            'day': TEXT,
            'start_at': DATETIME,
            'end_at': DATETIME,
            'timezone': TEXT
        }
