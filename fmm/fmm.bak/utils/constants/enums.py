from model_utils import Choices


# ===== Sex choices =====

MAN_SEX = 'MAN'
WOMAN_SEX = 'WOMAN'
OTHER_SEX = 'OTHER'

SEX_CHOICES = Choices(
    (MAN_SEX, 'man'),
    (WOMAN_SEX, 'woman'),
    (OTHER_SEX, 'other'),
)

MENTOR_ACC_NOT_APPLIED_STATUS = 'NOT_APPLIED'
MENTOR_ACC_WAITING_STATUS = 'WAITING_APPROVAL'
MENTOR_ACC_APPROVED_STATUS = 'APPROVED'
MENTOR_ACC_REJECTED_STATUS = 'REJECTED'

ASSIGNMENT_IN_PROGRESS = 'IN_PROGRESS'
ASSIGNMENT_WAITING_EVALUATION = 'WAITING_EVALUATION'
ASSIGNMENT_EVALUATED = 'EVALUATED'

ASSIGNMENT_STATUSES = Choices(
    (ASSIGNMENT_IN_PROGRESS, 'In progress'),
    (ASSIGNMENT_WAITING_EVALUATION, 'Waiting for evaluation by mentor'),
    (ASSIGNMENT_EVALUATED, 'Evaluated by mentor'),
)

MENTOR_STATUSES = Choices(
    (MENTOR_ACC_NOT_APPLIED_STATUS, 'Not applied'),
    (MENTOR_ACC_WAITING_STATUS, 'Waiting for approval'),
    (MENTOR_ACC_APPROVED_STATUS, 'Approved'),
    (MENTOR_ACC_REJECTED_STATUS, 'Rejected'),
)

# ======= MAIL SUBJECTS ======= #
INITIAL_PASSWORD_SET_SUBJECT = 'Password setting'
PASSWORD_RESET_SUBJECT = 'Password reset'

# ======= FRONT URLS ======= #
PASSWORD_RESET_FRONT_URL = '{front_url}/auth/password/?uid={uid}&token={token}'


# ======= TRANSACTIONS AND CARDS ======= #

# TODO change to currencies suitable for India
INR = 'INR'
USD = 'USD'
EUR = 'EUR'
RUB = 'RUB'
UAH = 'UAH'
BYN = 'BYN'
KZT = 'KZT'

CURRENCIES = Choices(
    (INR, 'INR'),
    (USD, 'USD'),
    (EUR, 'EUR'),
    (RUB, 'RUB'),
    (UAH, 'UAH'),
    (BYN, 'BYN'),
    (KZT, 'KZT')
)

TRANSACTION_REFUND_REASON = 'Canceling {transaction_description}'

TRANSACTION_CREATED_STATUS = 'CREATED'
TRANSACTION_PENDING_STATUS = 'PENDING'
TRANSACTION_HOLD_PENDING_STATUS = 'HOLD_PENDING'
TRANSACTION_HELD_STATUS = 'HELD'
TRANSACTION_SUCCESS_STATUS = 'SUCCESS'
TRANSACTION_FAIL_STATUS = 'FAIL'
TRANSACTION_REFUND_STATUS = 'REFUNDED'

TRANSACTION_STATUSES = Choices(
    (TRANSACTION_CREATED_STATUS, 'Transaction was created'),
    (TRANSACTION_PENDING_STATUS, 'Transaction is in pending state'),
    (TRANSACTION_HOLD_PENDING_STATUS, 'Hold transaction is in pending state'),
    (TRANSACTION_HELD_STATUS, 'Transaction to hold money is successful'),
    (TRANSACTION_SUCCESS_STATUS, 'Transaction is successful'),
    (TRANSACTION_FAIL_STATUS, 'Transaction failed'),
    (TRANSACTION_REFUND_STATUS, 'Transaction is refunded')
)

SUCCESS_STATUSES = {
    'RAZORPAY': ['Approved']
}

REFUND_STATUSES = {
    'RAZORPAY': ['Refunded', 'Voided']
}

FAIL_STATUSES = {
    'RAZORPAY': ['Expired', 'Declined']
}

RP_APPROVED_STATUS = 'Approved'
RP_TRANSACTION_SALE = 'SALE'  # charging money from card
RP_TRANSACTION_AUTH = 'AUTH'  # holding money on card
RP_TRANSACTION_VERIFICATION = 'VERIFY'  # verifying client card

TRANSACTION_PROVIDERS = Choices(
    ('RAZORPAY', 'RazorPay payment'),
    ('OTHER', 'Other type of payment')
)

CARD_TYPES = {
    'VISA ELECTRON': {
        'length': [16],
        'starts': ['4026', '417500', '4508',
                   '4844', '4913', '4917']
    },
    'VISA': {
        'length': [13, 16, 19],
        'starts': ['4']
    },
    'MASTERCARD': {
        'length': [16],
        'starts': (['51', '52', '53', '54', '55'] + [str(s) for s in range(222100, 272100)])
    },
    'MAESTRO': {
        'length': [16, 19],
        'starts': ['5018', '5020', '5038', '5893',
                   '6304', '6759', '6761', '6762', '6763']
    },
}
