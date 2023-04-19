from rest_framework.routers import SimpleRouter

from fmm.user.views import (UserPersonalInfoViewSet, UserViewSet, UserSocialInfoViewSet,
                            UserEducationViewSet, UserMentorAccountViewSet,
                            UserExpertiseViewSet, UserMentorScheduleViewSet,
                            UserMentorAccountPublicViewSet)
from fmm.utils.constants.endpoints import (USERS, USERS_PERSONAL_INFO, USERS_SOCIAL_INFO,
                                           USERS_EDUCATIONS, USERS_MENTOR_ACCOUNTS,
                                           USERS_EXPERTISE,
                                           USERS_MENTOR_SCHEDULES,
                                           USERS_MENTOR_ACCOUNTS_PUBLIC
                                           )

router = SimpleRouter()

router.register(USERS, UserViewSet, USERS)
router.register(USERS_SOCIAL_INFO, UserSocialInfoViewSet, USERS_SOCIAL_INFO)
router.register(USERS_PERSONAL_INFO, UserPersonalInfoViewSet, USERS_PERSONAL_INFO)
router.register(USERS_EDUCATIONS, UserEducationViewSet, USERS_EDUCATIONS)
router.register(USERS_MENTOR_ACCOUNTS, UserMentorAccountViewSet, USERS_MENTOR_ACCOUNTS)
router.register(USERS_EXPERTISE, UserExpertiseViewSet, USERS_EXPERTISE)
router.register(USERS_MENTOR_SCHEDULES, UserMentorScheduleViewSet, USERS_MENTOR_SCHEDULES)
router.register(USERS_MENTOR_ACCOUNTS_PUBLIC, UserMentorAccountPublicViewSet,
                USERS_MENTOR_ACCOUNTS_PUBLIC)


urlpatterns = router.urls
