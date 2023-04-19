from django.db import models
from fmm.utils.constants.table_names import SUBSCRIPTION_USER


class SubscriptionUser(models.Model):
    email = models.EmailField(unique=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = SUBSCRIPTION_USER
        ordering = ('id',)
