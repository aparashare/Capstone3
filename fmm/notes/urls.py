from rest_framework.routers import SimpleRouter

from fmm.utils.constants.endpoints import NOTES
from .views import NotesViewSet

router = SimpleRouter()
router.register('', NotesViewSet, NOTES)


urlpatterns = router.urls
