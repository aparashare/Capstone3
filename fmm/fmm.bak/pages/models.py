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
