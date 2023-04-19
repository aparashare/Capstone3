from fmm.payment.models import Transaction, PTPTransaction
from fmm.utils.BaseFilter import BaseFilter
from fmm.utils.constants.lookups import TEXT, BOOL, DATETIME, NUMERIC


class TransactionFilter(BaseFilter):
    class Meta:
        model = Transaction
        fields = {
            'uid': ['exact'],
            'status': TEXT,
            'external_status': TEXT,
            'ip_address': TEXT,
            'call_back_url': TEXT,
            'action': TEXT,
            'amount': NUMERIC,
            'fee': NUMERIC,
            'currency': TEXT,
            'card_pan': TEXT,
            'is_test': BOOL,
            'success_at': DATETIME,
            'refund_at': DATETIME,
            'created_at': DATETIME,
            'updated_at': DATETIME
        }


class PTPTransactionFilter(BaseFilter):
    class Meta:
        model = PTPTransaction
        fields = dict(
            TransactionFilter.Meta.fields,
            **{'beneficiary_card': TEXT}
        )
