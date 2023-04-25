from django.contrib import admin
from fmm.payment.models import Transaction, PTPTransaction


def validate_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.validate()


def charge_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.charge()


def settle_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.settle()


def hold_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.hold()


def unhold_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.unhold()


def refund_transactions(modeladmin, request, queryset):
    for transaction in queryset:
        transaction.refund()


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    actions = [validate_transactions, charge_transactions, settle_transactions,
               hold_transactions, unhold_transactions, refund_transactions]


@admin.register(PTPTransaction)
class PTPTransactionAdmin(admin.ModelAdmin):
    actions = [validate_transactions, charge_transactions, settle_transactions,
               hold_transactions, unhold_transactions, refund_transactions]
