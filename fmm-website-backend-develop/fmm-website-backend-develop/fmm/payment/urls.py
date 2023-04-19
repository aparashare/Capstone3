from rest_framework.routers import SimpleRouter

from fmm.payment.views import TransactionViewSet, PTPTransactionViewSet
from fmm.utils.constants.endpoints import TRANSACTIONS, PTP_TRANSACTIONS

router = SimpleRouter()

router.register(TRANSACTIONS, TransactionViewSet, TRANSACTIONS)
router.register(PTP_TRANSACTIONS, PTPTransactionViewSet, PTP_TRANSACTIONS)

urlpatterns = router.urls
