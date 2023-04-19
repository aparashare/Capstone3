from django.urls import re_path
from rest_framework.routers import SimpleRouter

from fmm.pages import views
from fmm.utils.constants.endpoints import FAQ, METADATA

router = SimpleRouter()


router.register(FAQ, views.FaqViewSet, FAQ)
router.register(METADATA, views.MetaDataViewSet, METADATA)

urlpatterns = router.urls

urlpatterns += [
    re_path(r'^(?P<url>.*/)$', views.flatpage),
]
