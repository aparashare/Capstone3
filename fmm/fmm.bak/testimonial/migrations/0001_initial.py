# Generated by Django 3.0.3 on 2020-06-25 14:08

from django.db import migrations, models
import fmm.testimonial.models
import fmm.utils.storage


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Testimonial',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('profession', models.CharField(max_length=255)),
                ('expertise', models.CharField(max_length=255)),
                ('content', models.CharField(max_length=2000)),
                ('photo', models.ImageField(storage=fmm.utils.storage.OverwriteStorage(), upload_to=fmm.testimonial.models.testimonial_photo_upload_path)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'testimonial',
                'ordering': ('id',),
            },
        ),
    ]