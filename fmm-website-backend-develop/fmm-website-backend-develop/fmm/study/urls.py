from rest_framework.routers import SimpleRouter

from fmm.study.views import (
    AppointmentAssignmentUserViewSet,
    AppointmentAssignmentViewSet,
    AppointmentUserViewSet,
    AppointmentViewSet,
    GroupCallViewSet,
    RazorPayPaymentViewSet,
    WorkshopAssignmentUserViewSet,
    WorkshopAssignmentViewSet,
    WorkshopCouponViewSet,
    WorkshopRecordingViewSet,
    WorkshopUserViewSet,
    WorkshopViewSet,
)
from fmm.utils.constants.endpoints import (
    APPOINTMENT_ASSIGNMENT_USERS,
    APPOINTMENT_ASSIGNMENTS,
    APPOINTMENT_USERS,
    APPOINTMENTS,
    GROUP_CALLS,
    RAZOR_PAY_PAYMENT,
    WORKSHOP_ASSIGNMENT_USERS,
    WORKSHOP_ASSIGNMENTS,
    WORKSHOP_COUPONS,
    WORKSHOP_RECORDINGS,
    WORKSHOP_USERS,
    WORKSHOPS,
)

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
router.register(RAZOR_PAY_PAYMENT, RazorPayPaymentViewSet,
                RAZOR_PAY_PAYMENT)

urlpatterns = router.urls
