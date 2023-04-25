from django.contrib import admin

from fmm.poll.models import Poll, PollAnswer


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    pass


@admin.register(PollAnswer)
class PollAnswerAdmin(admin.ModelAdmin):
    pass
