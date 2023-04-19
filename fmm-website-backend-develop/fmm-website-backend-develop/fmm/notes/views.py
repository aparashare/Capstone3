from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets

from .serializers import NotesSerializer, NotesPublicSerializer

from .models import Notes


class NotesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Notes.objects.all()
    serializer_class = NotesSerializer
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,
                       DjangoFilterBackend)
    filter_fields = ["user", "workshop"]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return NotesPublicSerializer
        return self.serializer_class
