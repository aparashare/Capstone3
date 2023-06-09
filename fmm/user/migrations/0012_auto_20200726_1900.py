# Generated by Django 3.0.3 on 2020-07-26 13:30

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0011_auto_20200725_0231'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpersonalinfo',
            name='phone',
            field=models.CharField(max_length=15, validators=[django.core.validators.RegexValidator(message='Phone has to be numeric and from 11 to 13 characters', regex='^(\\+\\d{1,3}[- ]?)?\\d{10}$')]),
        ),
    ]
