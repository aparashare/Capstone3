
from django.db import models
from django.contrib.auth import get_user_model

from fmm.utils.constants.table_names import NOTES

User = get_user_model()


class Notes(models.Model):
    user = models.ForeignKey(User, related_name='notes',
                             on_delete=models.CASCADE)
    workshop = models.ForeignKey('study.Workshop', related_name='notes',
                                 on_delete=models.CASCADE)
    content = models.TextField(max_length=10000)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = NOTES
        ordering = ('id', )
