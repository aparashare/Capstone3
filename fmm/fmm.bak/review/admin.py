from django.contrib import admin
from fmm.review.models import MentorReview, WorkshopReview


@admin.register(MentorReview)
class MentorReviewAdmin(admin.ModelAdmin):
    pass


@admin.register(WorkshopReview)
class WorkshopReviewAdmin(admin.ModelAdmin):
    pass
