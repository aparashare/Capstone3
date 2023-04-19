"""
This file is subject to the terms and conditions defined in the
file 'LICENSE.txt', which is a part of this source code package.
"""
from abc import ABC, abstractmethod

from typing import TYPE_CHECKING, Type
if TYPE_CHECKING:
    # https://stackoverflow.com/questions/39740632/python-type-hinting-without-cyclic-imports
    from fmm.payment.models import Transaction, PTPTransaction, AbstractTransaction


class AbstractTransactionHandler(ABC):

    @abstractmethod
    def verify(self, transaction: 'Transaction', cvv: str):
        """
        Starts verification process of users card credentials.
        """
        pass

    def ptp_transfer(self, transaction: 'PTPTransaction') -> bool:
        """
        Transfer money directly from one card to another.
        """
        pass

    @abstractmethod
    def charge(self, transaction: 'Transaction') -> bool:
        """
        Charges money from user to our account.
        """
        pass

    @abstractmethod
    def refund(self, transaction: 'Type[AbstractTransaction]') -> bool:
        """
        Refunds or declines transaction. Depends on it state.
        """
        pass

    @abstractmethod
    def hold(self, transaction: 'Transaction') -> bool:
        """
        Holds money on users account with timeout up to 20 days.
        """
        pass

    @abstractmethod
    def settle(self, transaction: 'Transaction') -> bool:
        """
        Charges money from users account that were held before.
        """
        pass

    @abstractmethod
    def unhold(self, transaction: 'Transaction') -> bool:
        """
        Declines hold on users account.
        """
        pass
