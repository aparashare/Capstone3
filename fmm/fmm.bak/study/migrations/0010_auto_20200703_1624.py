# Generated by Django 3.0.3 on 2020-07-03 13:24

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('study', '0009_auto_20200619_1748'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workshop',
            name='amount',
            field=models.SmallIntegerField(validators=[django.core.validators.MinValueValidator(2), django.core.validators.MaxValueValidator(100)]),
        ),
    ]