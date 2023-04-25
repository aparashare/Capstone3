from rest_framework.routers import SimpleRouter

from fmm.testimonial.views import TestimonialViewSet
from fmm.utils.constants.endpoints import TESTIMONIALS

router = SimpleRouter()

router.register(TESTIMONIALS, TestimonialViewSet, TESTIMONIALS)

urlpatterns = router.urls
