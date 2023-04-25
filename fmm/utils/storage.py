import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage


class OverwriteStorage(FileSystemStorage):

    def get_available_name(self, name, max_length=None):
        if self.exists(name):
            os.remove(os.path.join(settings.MEDIA_ROOT, name))
        return name


class NewFileStorage(FileSystemStorage):

    def get_available_name(self, name, max_length=None):
        if self.exists(name):
            splitted = name.split('.')
            name = f'{splitted[0]}(NEW).{".".join(splitted[1:])}'
        return name
