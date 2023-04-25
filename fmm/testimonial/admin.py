from django.contrib import admin

from fmm.testimonial.models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    pass
