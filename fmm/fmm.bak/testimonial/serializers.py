from rest_framework import serializers

from fmm.testimonial.models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'


class TestimonialPublicSerializer(serializers.ModelSerializer):
    photo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Testimonial
        fields = '__all__'

    def get_photo(self, instance):
        return instance.photo.url
