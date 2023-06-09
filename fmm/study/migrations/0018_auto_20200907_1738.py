# Generated by Django 3.0.3 on 2020-09-07 12:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('study', '0017_razorpaypayment'),
    ]

    operations = [
        migrations.AddField(
            model_name='razorpaypayment',
            name='amount',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=9),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='razorpaypayment',
            name='status',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='razorpaypayment',
            name='workshop',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='razor_pay_payments', to='study.Workshop'),
            preserve_default=False,
        ),
    ]
