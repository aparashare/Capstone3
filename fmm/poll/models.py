from django.contrib.postgres.fields import ArrayField
from django.db import models

from fmm.poll.errors import MultipleForbiddenError, IncorrectAnswerError
from fmm.utils.constants.table_names import POLL_ANSWER, POLL
from fmm.utils.global_request import get_current_user


class Poll(models.Model):
    question = models.CharField(max_length=255)

    options = ArrayField(base_field=models.CharField(max_length=255), max_length=25,
                         default=list)

    workshop = models.ForeignKey('study.Workshop', related_name='polls',
                                 null=True, blank=True, on_delete=models.CASCADE)
    appointment = models.ForeignKey('study.Appointment', related_name='polls',
                                    null=True, blank=True, on_delete=models.CASCADE)

    allow_multiple = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = POLL
        ordering = ('id',)

    def vote(self, answer: str) -> 'PollAnswer':
        return PollAnswer.objects.create(
            user=get_current_user(),
            poll=self,
            answer=answer)


class PollAnswer(models.Model):
    poll = models.ForeignKey('poll.Poll', related_name='answers', on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', related_name='poll_answers', on_delete=models.CASCADE)

    answer = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = POLL_ANSWER
        ordering = ('id',)
        unique_together = ('poll', 'user', 'answer')

    def __str__(self) -> str:
        return (f'{self.__class__.__name__} | poll="{self.poll}" |'
                f'user="{self.user}" | answer="{self.answer}"')

    def _check_multiple(self):
        if self._state.adding:
            return PollAnswer.objects.filter(user=self.user, poll=self.poll).exists()
        else:
            return (PollAnswer.objects
                    .exclude(id=self.id)
                    .filter(user=self.user, poll=self.poll).exists())

    def clean(self) -> None:
        if not self.poll.allow_multiple and self._check_multiple():
            raise MultipleForbiddenError()
        if self.answer not in self.poll.options:
            raise IncorrectAnswerError()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
