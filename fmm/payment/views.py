import django_filters
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import is_in_group, get_required_groups, CustomGroupPermission
from fmm.payment.filters import TransactionFilter, PTPTransactionFilter
from fmm.payment.models import Transaction, PTPTransaction
from fmm.payment.serializers import TransactionSerializer, PTPTransactionSerializer
from fmm.utils.constants.endpoints import TRANSACTION_STATUS_CHECK
from fmm.utils.constants.permissions import GROUP_USER
from fmm.utils.constants.permissions import TRANSACTION, PTP_TRANSACTION
from fmm.utils.helper import METHOD_POST


class TransactionViewSet(viewsets.ModelViewSet):
    model = Transaction
    queryset = Transaction.objects.all()
    filter_class = TransactionFilter
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    ordering_fields = '__all__'
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(TRANSACTION)

    def update(self, request, *args, **kwargs):
        # Just leave it here to not forget make it forbidden in permissions
        return super().update(request, *args, **kwargs)

    @action(detail=True,
            methods=[METHOD_POST],
            url_path=TRANSACTION_STATUS_CHECK)
    def recheck_status(self, request, pk) -> Response:
        with db_transaction.atomic():
            try:
                # finding transaction to work with
                _ = (
                    self.model.objects
                    .select_for_update()
                    .get(uid=pk)
                )
            except self.model.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            # provider = transaction.get_provider_class()
            # TODO some stuff here to check its status after
            # TODO finishing handler classes
            return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    @action(detail=True,
            methods=[METHOD_POST])
    def refund(self, request, pk) -> Response:
        with db_transaction.atomic():
            try:
                transaction = (
                    self.model.objects
                        .select_for_update()
                        .get(uid=pk)
                )
            except self.model.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            transaction.refund()
        return Response(TransactionSerializer(transaction).data)

    @action(detail=True,
            methods=[METHOD_POST])
    def validate(self, request, pk) -> Response:
        with db_transaction.atomic():
            try:
                transaction = (
                    self.model.objects
                    .select_for_update()
                    .get(uid=pk)
                )
            except self.model.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
            transaction.validate()
        return Response(TransactionSerializer(transaction).data)

    def get_queryset(self):
        if is_in_group(self.request.user, GROUP_USER):
            # TODO return to user only transactions related to him
            pass
        return super().get_queryset()

    def get_serializer_class(self):
        return TransactionSerializer

    @action(detail=True,
            methods=[METHOD_POST],
            permission_classes=[permissions.AllowAny])
    def update_status(self, request, pk):
        transaction = get_object_or_404(klass=self.model, pk=pk)

        provider = transaction.provider_class_instance()

        signature_check, resp = provider.handle_incoming_request(request, transaction)

        resp.update({"initial": str(request.data)})
        return Response(resp)


class PTPTransactionViewSet(TransactionViewSet):
    model = PTPTransaction
    queryset = PTPTransaction.objects.all()
    filter_class = PTPTransactionFilter
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    ordering_fields = '__all__'
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(PTP_TRANSACTION)

    def get_serializer_class(self):
        return PTPTransactionSerializer

    def get_queryset(self):
        if is_in_group(self.request.user, GROUP_USER):
            # TODO return to user only transactions related to him
            pass
        return super().get_queryset()
