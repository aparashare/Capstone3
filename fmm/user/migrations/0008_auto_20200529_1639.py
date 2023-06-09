# Generated by Django 3.0.3 on 2020-05-29 13:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0007_auto_20200528_1338'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usermentoraccount',
            name='status',
            field=models.CharField(choices=[('NOT_APPLIED', 'Not applied'), ('WAITING_APPROVAL', 'Waiting for approval'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='NOT_APPLIED', editable=False, max_length=255),
        ),
    ]
