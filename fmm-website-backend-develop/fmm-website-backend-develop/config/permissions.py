from django.contrib.auth.models import Group
from rest_framework import permissions

from fmm.utils.constants.permissions import (GROUP_ADMIN, GROUP_MENTOR, GROUP_USER,
                                             APPOINTMENT, APPOINTMENT_ASSIGNMENT,
                                             APPOINTMENT_ASSIGNMENT_USER, APPOINTMENT_RECORDING,
                                             APPOINTMENT_USER, MENTOR_REVIEW, POLL, POLL_ANSWER,
                                             PTP_TRANSACTION, TRANSACTION, USER, USER_EDUCATION,
                                             USER_EXPERTISE, USER_MENTOR_ACCOUNT,
                                             USER_MENTOR_SCHEDULE, USER_PERSONAL_INFO,
                                             USER_SOCIAL_INFO, WORKSHOP, WORKSHOP_ASSIGNMENT,
                                             WORKSHOP_ASSIGNMENT_USER, WORKSHOP_COUPON,
                                             WORKSHOP_RECORDING, WORKSHOP_REVIEW, WORKSHOP_USER,
                                             GROUP_CALL, SUBSCRIPTION_USER, TESTIMONIAL, LEAD_USER)
from fmm.utils.helper import (METHOD_SAFE, METHOD_PATCH, METHOD_POST,
                              METHOD_DELETE, METHOD_PUT)

PUBLIC = 'PUBLIC'
ADMIN = [GROUP_ADMIN]
MENTOR = [GROUP_MENTOR, GROUP_ADMIN]
ALL = [GROUP_USER, GROUP_MENTOR, GROUP_ADMIN]

SAFE_ALL_MENTOR = {
    METHOD_SAFE: ALL,
    METHOD_POST: MENTOR,
    METHOD_PUT: MENTOR,
    METHOD_PATCH: MENTOR,
    METHOD_DELETE: MENTOR,
}

SAFE_ALL_ADMIN = {
    METHOD_SAFE: ALL,
    METHOD_POST: ADMIN,
    METHOD_PUT: ADMIN,
    METHOD_PATCH: ADMIN,
    METHOD_DELETE: ADMIN,
}

FULL_PERMISSION = {
    METHOD_SAFE: ALL,
    METHOD_POST: ALL,
    METHOD_PUT: ALL,
    METHOD_PATCH: ALL,
    METHOD_DELETE: ALL,
}

SAFE_CREATE_UPDATE_ALL_ADMIN = {
    METHOD_SAFE: ALL,
    METHOD_POST: ALL,
    METHOD_PUT: ALL,
    METHOD_PATCH: ALL,
    METHOD_DELETE: ADMIN,
}

PERMISSIONS = {
    APPOINTMENT: SAFE_ALL_MENTOR,

    APPOINTMENT_USER: FULL_PERMISSION,

    APPOINTMENT_ASSIGNMENT: SAFE_ALL_MENTOR,

    APPOINTMENT_RECORDING: SAFE_ALL_MENTOR,

    APPOINTMENT_ASSIGNMENT_USER: FULL_PERMISSION,

    POLL: SAFE_ALL_MENTOR,

    POLL_ANSWER: FULL_PERMISSION,

    MENTOR_REVIEW: FULL_PERMISSION,

    PTP_TRANSACTION: SAFE_ALL_ADMIN,

    TRANSACTION: SAFE_ALL_ADMIN,

    USER: {
        METHOD_SAFE: PUBLIC,
        METHOD_POST: ALL,
        METHOD_PUT: ALL,
        METHOD_PATCH: ALL,
        METHOD_DELETE: ADMIN,
    },

    USER_PERSONAL_INFO: SAFE_CREATE_UPDATE_ALL_ADMIN,

    USER_SOCIAL_INFO: SAFE_CREATE_UPDATE_ALL_ADMIN,

    USER_EDUCATION: FULL_PERMISSION,

    USER_EXPERTISE: FULL_PERMISSION,

    USER_MENTOR_SCHEDULE: {
        METHOD_SAFE: ALL,
        METHOD_POST: ALL,
        METHOD_PUT: ALL,
        METHOD_PATCH: ALL,
        METHOD_DELETE: ALL,
    },

    USER_MENTOR_ACCOUNT: {
        METHOD_SAFE: PUBLIC,
        METHOD_POST: ALL,
        METHOD_PUT: ALL,
        METHOD_PATCH: ALL,
        METHOD_DELETE: ALL,
    },

    WORKSHOP: {
        METHOD_SAFE: PUBLIC,
        METHOD_POST: MENTOR,
        METHOD_PUT: MENTOR,
        METHOD_PATCH: MENTOR,
        METHOD_DELETE: MENTOR,
    },

    GROUP_CALL: SAFE_ALL_MENTOR,
    WORKSHOP_RECORDING: SAFE_ALL_MENTOR,

    WORKSHOP_USER: FULL_PERMISSION,

    WORKSHOP_COUPON: SAFE_ALL_MENTOR,

    WORKSHOP_ASSIGNMENT: SAFE_ALL_MENTOR,

    WORKSHOP_ASSIGNMENT_USER: FULL_PERMISSION,

    WORKSHOP_REVIEW: FULL_PERMISSION,

    SUBSCRIPTION_USER: {
        METHOD_SAFE: ADMIN,
        METHOD_POST: PUBLIC,
        METHOD_PUT: ADMIN,
        METHOD_PATCH: ADMIN,
        METHOD_DELETE: ADMIN,
    },
    TESTIMONIAL: {
        METHOD_SAFE: PUBLIC,
        METHOD_POST: ADMIN,
        METHOD_PUT: ADMIN,
        METHOD_PATCH: ADMIN,
        METHOD_DELETE: ADMIN,
    },
    LEAD_USER: {
        METHOD_SAFE: ADMIN,
        METHOD_POST: PUBLIC,
        METHOD_PUT: ADMIN,
        METHOD_PATCH: ADMIN,
        METHOD_DELETE: ADMIN,
    }
}


def get_required_groups(view_class_name):
    groups_dict = PERMISSIONS.get(view_class_name)
    return groups_dict


def is_in_group(user, group_name):
    """
    Check if user is a member of given group
    """
    try:
        result = Group.objects.get(name=group_name).user_set.filter(id=user.id).exists()
    except Group.DoesNotExist:
        print('Group not found during CustomGroupPermission check.')
        result = False
    return result


class CustomGroupPermission(permissions.BasePermission):
    """
    Custom permissions according to user's groups
    """

    message = ('You do not have permission to perform this action'
               ' according to Custom Group Permissions.')

    def has_permission(self, request, view):
        required_groups_mapping = getattr(view, 'required_groups', {})
        if request.method in permissions.SAFE_METHODS:
            required_groups = required_groups_mapping.get(METHOD_SAFE, [])
        else:
            required_groups = required_groups_mapping.get(request.method, [])
        if required_groups == PUBLIC:
            return True
        allow = any([is_in_group(request.user, group_name) for group_name in required_groups])
        return allow
