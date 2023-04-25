# Generated by Django 3.0.3 on 2020-10-05 11:28

import datetime
from django.db import migrations, models
import fmm.utils.validators


class Migration(migrations.Migration):

    dependencies = [
        ('study', '0019_auto_20200912_2231'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='end_at',
            field=models.DateTimeField(blank=True, null=True, validators=[fmm.utils.validators.NotPastValidator(), fmm.utils.validators.NotFarFutureValidator(datetime.timedelta(days=60))]),
        ),
        migrations.AddField(
            model_name='workshop',
            name='end_at',
            field=models.DateTimeField(blank=True, null=True, validators=[fmm.utils.validators.NotPastValidator(), fmm.utils.validators.NotFarFutureValidator(datetime.timedelta(days=60))]),
        ),
    ]