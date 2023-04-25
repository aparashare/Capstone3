from rest_framework.routers import SimpleRouter

from fmm.study.views import (AppointmentAssignmentUserViewSet, AppointmentAssignmentViewSet,
                             AppointmentUserViewSet, AppointmentViewSet, WorkshopViewSet,
                             WorkshopAssignmentUserViewSet, WorkshopAssignmentViewSet,
                             WorkshopCouponViewSet, WorkshopUserViewSet, WorkshopRecordingViewSet,
                             GroupCallViewSet)
from fmm.utils.constants.endpoints import (WORKSHOP_ASSIGNMENT_USERS, WORKSHOP_ASSIGNMENTS,
                                           WORKSHOP_COUPONS, WORKSHOP_USERS, WORKSHOPS,
                                           APPOINTMENT_ASSIGNMENT_USERS, APPOINTMENT_ASSIGNMENTS,
                                           APPOINTMENT_USERS, APPOINTMENTS, WORKSHOP_RECORDINGS,
                                           GROUP_CALLS)


router = SimpleRouter()

router.register(WORKSHOPS, WorkshopViewSet, WORKSHOPS)
router.register(GROUP_CALLS, GroupCallViewSet, GROUP_CALLS)
router.register(WORKSHOP_USERS, WorkshopUserViewSet, WORKSHOP_USERS)
router.register(WORKSHOP_COUPONS, WorkshopCouponViewSet, WORKSHOP_COUPONS)
router.register(WORKSHOP_RECORDINGS, WorkshopRecordingViewSet, WORKSHOP_RECORDINGS)
router.register(WORKSHOP_ASSIGNMENTS, WorkshopAssignmentViewSet, WORKSHOP_ASSIGNMENTS)
router.register(WORKSHOP_ASSIGNMENT_USERS, WorkshopAssignmentUserViewSet, WORKSHOP_ASSIGNMENT_USERS)
router.register(APPOINTMENTS, AppointmentViewSet, APPOINTMENTS)
router.register(APPOINTMENT_ASSIGNMENTS, AppointmentAssignmentViewSet, APPOINTMENT_ASSIGNMENTS)
router.register(APPOINTMENT_USERS, AppointmentUserViewSet, APPOINTMENT_USERS)
router.register(APPOINTMENT_ASSIGNMENT_USERS, AppointmentAssignmentUserViewSet,
                APPOINTMENT_ASSIGNMENT_USERS)

urlpatterns = router.urls
