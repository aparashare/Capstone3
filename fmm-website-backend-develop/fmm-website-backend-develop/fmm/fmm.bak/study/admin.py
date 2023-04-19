from django.contrib import admin

from fmm.study.models import (WorkshopAssignmentUser, WorkshopAssignment, Workshop,
                              WorkshopCoupon, WorkshopUser, Appointment, AppointmentAssignment,
                              AppointmentAssignmentUser, AppointmentUser)


def finish_assignment_user(modeladmin, request, queryset):
    # applies assignment user for evaluation
    for assignment_user in queryset:
        assignment_user.finish()


def launch_assignment_on_users(modeladmin, request, queryset):
    for assignment in queryset:
        assignment.launch_on_users()


@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    pass


@admin.register(WorkshopUser)
class WorkshopUserAdmin(admin.ModelAdmin):
    pass


@admin.register(WorkshopCoupon)
class WorkshopCouponAdmin(admin.ModelAdmin):
    pass


@admin.register(WorkshopAssignmentUser)
class WorkshopAssignmentUserAdmin(admin.ModelAdmin):
    actions = [finish_assignment_user, ]


@admin.register(WorkshopAssignment)
class WorkshopAssignmentAdmin(admin.ModelAdmin):
    actions = [launch_assignment_on_users, ]


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    pass


@admin.register(AppointmentAssignment)
class AppointmentAssignmentAdmin(admin.ModelAdmin):
    pass


@admin.register(AppointmentAssignmentUser)
class AppointmentAssignmentUserAdmin(admin.ModelAdmin):
    actions = [finish_assignment_user, ]


@admin.register(AppointmentUser)
class AppointmentUserAdmin(admin.ModelAdmin):
    pass
