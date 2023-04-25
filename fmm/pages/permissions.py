from rest_framework import permissions


class IsStaffSuperuserOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        # Read only permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only staff or admin
        return request.user.is_superuser or request.user.is_staff
