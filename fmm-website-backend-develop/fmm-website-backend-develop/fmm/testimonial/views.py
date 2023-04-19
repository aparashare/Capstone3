from rest_framework import viewsets

from config.permissions import CustomGroupPermission, get_required_groups
from fmm.testimonial.models import Testimonial
from fmm.testimonial.serializers import TestimonialSerializer, TestimonialPublicSerializer
from fmm.utils.constants.permissions import TESTIMONIAL
from fmm.utils.helper import METHOD_GET


class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer
    queryset = Testimonial.objects.all()

    permission_classes = [
        CustomGroupPermission
    ]
    required_groups = get_required_groups(TESTIMONIAL)

    def get_serializer_class(self):
        if self.request.method == METHOD_GET:
            return TestimonialPublicSerializer
        else:
            return TestimonialSerializer
