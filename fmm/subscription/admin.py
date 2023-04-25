from django.contrib import admin
from fmm.subscription.models import SubscriptionUser


@admin.register(SubscriptionUser)
class SubscriptionUserAdmin(admin.ModelAdmin):
    search_fields = ["email"]
