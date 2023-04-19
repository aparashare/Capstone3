from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class PublicMediaStorage(S3Boto3Storage):
    location = settings.AWS_PUBLIC_MEDIA_LOCATION
    default_acl = 'public'
    file_overwrite = False


class TestimonialStorage(S3Boto3Storage):
    location = settings.AWS_TESTIMONIAL_MEDIA_LOCATION
    default_acl = 'public'
    file_overwrite = False
    custom_domain = False
