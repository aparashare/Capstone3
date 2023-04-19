from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from fmm.utils.constants.table_names import MENTOR_REVIEW, WORKSHOP_REVIEW


class AbstractReview(models.Model):
    user = models.ForeignKey('user.User', related_name='reviews',
                             on_delete=models.CASCADE)

    title = models.CharField(max_length=255)
    content = models.TextField(max_length=4000)

    hidden_content = models.TextField(max_length=2000, null=True, blank=True)

    mark = models.FloatField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10)
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class MentorReview(AbstractReview):
    user = models.ForeignKey('user.User', related_name='mentor_reviews',
                             on_delete=models.CASCADE)
    mentor = models.ForeignKey('user.UserMentorAccount', related_name='mentor_reviews',
                               on_delete=models.CASCADE)

    class Meta:
        db_table = MENTOR_REVIEW
        ordering = ('id',)
        unique_together = ('user', 'mentor')


class WorkshopReview(AbstractReview):
    user = models.ForeignKey('user.User', related_name='workshop_reviews',
                             on_delete=models.CASCADE)
    workshop = models.ForeignKey('study.Workshop', related_name='workshop_reviews',
                                 on_delete=models.CASCADE)

    class Meta:
        db_table = WORKSHOP_REVIEW
        ordering = ('id',)
        unique_together = ('user', 'workshop')
