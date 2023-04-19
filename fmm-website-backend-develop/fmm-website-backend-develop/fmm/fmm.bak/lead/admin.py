from django.contrib import admin

from fmm.lead.models import LeadUser


@admin.register(LeadUser)
class LeadUserAdmin(admin.ModelAdmin):
    pass
