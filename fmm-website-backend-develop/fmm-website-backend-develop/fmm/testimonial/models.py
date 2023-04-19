from django.db import models

from fmm.utils.constants.constants import TESTIMONIAL_PHOTO_PATH
from fmm.utils.constants.table_names import TESTIMONIAL


def testimonial_photo_upload_path(instance, filename):
    return f'{TESTIMONIAL_PHOTO_PATH}/{filename}'


class Testimonial(models.Model):
    name = models.CharField(max_length=255)
    profession = models.CharField(max_length=255)
    expertise = models.CharField(max_length=255)
    content = models.CharField(max_length=2000)

    photo = models.FileField()

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = TESTIMONIAL
        ordering = ('id',)

    #  def save(self, *args, **kwargs):
    #      if self._state.adding and self.photo:
    #          self.photo.name = (f'{slugify(self.name)}_{slugify(self.profession)}'
    #                             f'.{self.photo.name.split(".")[-1]}')
    #      super().save(*args, **kwargs)
