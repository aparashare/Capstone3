from rest_framework import serializers

from fmm.review.models import MentorReview, WorkshopReview


class MentorPublicReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorReview
        exclude = ('hidden_content',)


class MentorAdminReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorReview
        fields = '__all__'


class WorkshopPublicReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopReview
        exclude = ('hidden_content',)


class WorkshopAdminReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopReview
        fields = '__all__'
