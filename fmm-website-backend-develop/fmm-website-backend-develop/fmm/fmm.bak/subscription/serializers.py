from rest_framework import serializers

from fmm.subscription.models import SubscriptionUser


class SubscriptionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionUser
        fields = '__all__'
