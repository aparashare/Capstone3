
from rest_framework import serializers

from fmm.study.serializers import WorkshopPublicSerializer
from fmm.user.serializers import UserShortPublicSerializer

from . import models


class NotesSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Notes
        fields = "__all__"


class NotesPublicSerializer(serializers.ModelSerializer):
    user = UserShortPublicSerializer(read_only=True)
    workshop = WorkshopPublicSerializer(read_only=True)

    class Meta:
        model = models.Notes
        fields = "__all__"
