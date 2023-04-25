from django.urls import re_path
from rest_framework.routers import SimpleRouter

from fmm.utils.constants.endpoints import FAQ
from fmm.pages import views

router = SimpleRouter()


router.register(FAQ, views.FaqViewSet, FAQ)

urlpatterns = router.urls

urlpatterns += [
    re_path(r'^(?P<url>.*/)$', views.flatpage),
]
