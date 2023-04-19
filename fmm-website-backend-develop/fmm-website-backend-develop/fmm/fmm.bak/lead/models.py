from django.db import models

from fmm.utils.constants.table_names import LEAD_USER


class LeadUser(models.Model):
    # in case you will link user with his original lead
    user = models.OneToOneField("user.User", related_name="lead", null=True, blank=True,
                                on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=255)
    comment = models.CharField(max_length=2000)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = LEAD_USER
        ordering = ('id',)
