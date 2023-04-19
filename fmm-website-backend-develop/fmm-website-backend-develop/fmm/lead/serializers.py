from rest_framework import serializers

from fmm.lead.models import LeadUser


class LeadUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadUser
        fields = '__all__'
