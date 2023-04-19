from django.db import models

from taggit.managers import TaggableManager


class Faq(models.Model):
    title = models.CharField(max_length=250, verbose_name='Title', unique=True,
                             help_text='FAQ title')
    body = models.TextField(verbose_name='Body', help_text='1000 words')
    status = models.BooleanField(default=False, verbose_name='Active FAQ')
    tags = TaggableManager()

    def __str__(self):
        return self.title


class MetaData(models.Model):
    title = models.CharField(max_length=256, verbose_name="Title", unique=True)
    content = models.TextField(verbose_name="Content")
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    def __str__(self):
        return self.title
