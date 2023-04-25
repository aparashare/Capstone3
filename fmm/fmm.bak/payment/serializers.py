from rest_framework import serializers

from fmm.payment.models import Transaction, PTPTransaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class PTPTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PTPTransaction
        fields = '__all__'
