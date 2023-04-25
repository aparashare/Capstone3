from django.contrib import admin
from django.contrib.flatpages.models import FlatPage
from django.utils.translation import gettext_lazy as _

from .models import Faq
from .forms import CustomFlatpageForm


@admin.register(Faq)
class FaqAdmin(admin.ModelAdmin):
    pass


admin.site.unregister(FlatPage)


@admin.register(FlatPage)
class CustomFlatPageAdmin(admin.ModelAdmin):
    form = CustomFlatpageForm
    fieldsets = (
        (None, {'fields': ('url', 'title', 'content', 'sites')}),
        (_('Advanced options'), {
            'classes': ('collapse',),
            'fields': ('registration_required', 'template_name'),
        }),
    )
    list_display = ('url', 'title')
    list_filter = ('sites', 'registration_required')
    search_fields = ('url', 'title')
