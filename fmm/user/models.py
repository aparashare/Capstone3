from datetime import time
from typing import Optional

from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator, MinValueValidator
from django.db import models
from django.db.models import Sum
from django.template import loader
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django_countries.fields import CountryField
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.postgres.fields import JSONField
from djmoney.models.fields import MoneyField
from rest_framework.exceptions import ValidationError

from fmm.study.models import StudyPayment
from fmm.utils.constants.enums import (SEX_CHOICES, MENTOR_STATUSES, PASSWORD_RESET_SUBJECT,
                                       INITIAL_PASSWORD_SET_SUBJECT, PASSWORD_RESET_FRONT_URL)
from fmm.utils.constants.permissions import GROUP_MENTOR
from fmm.utils.constants.table_names import (USER_TABLE, USER_PERSONAL_INFO_TABLE_NAME,
                                             USER_SOCIAL_INFO_TABLE_NAME,
                                             USER_YUWEE_REGISTRATION_TABLE_NAME, USER_EDUCATION,
                                             USER_MENTOR_ACCOUNT_TABLE_NAME, USER_EXPERTISE,
                                             USER_MENTOR_SCHEDULE_TABLE_NAME)
from fmm.utils.constants.template_names import INITIAL_PASSWORD_SET
from fmm.utils.fields import DayOfTheWeekField, DAY_OF_THE_WEEK
from fmm.utils.global_request import get_current_user
from fmm.utils.helper import gen_random_password
from fmm.utils.sendgrid import MailSender
from fmm.utils.validators import MaxAgeValidator, MinAgeValidator
from fmm.utils.yuwee import YuweeHelper
from fmm.utils.exceptions import YuweeUserExistsError


def user_avatar_path(instance, filename):
    return f'avatars/{filename}'


class User(AbstractUser):
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        blank=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )

    email = models.EmailField(unique=True)

    avatar = models.ImageField(null=True, blank=True)

    class Meta:
        db_table = USER_TABLE
        ordering = ('id',)

    def __str__(self) -> str:
        return f'{self.id}_{self.username}'

    def __repr__(self) -> str:
        return f'{self.id}_{self.username}'

    def clean(self):

        if self.avatar.name and not self.avatar.name.startswith(self.username_clear()):
            # pycharm tells that you can not set name, but actually you can and it works :)
            self.avatar.name = f'{self.username_clear()}.{self.avatar.name.split(".")[-1]}'

    def username_clear(self) -> str:
        return self.username.replace('@', '').replace('.', '')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def change_password(self, old_password: str, new_password: str) -> None:
        if self.check_password(new_password):
            raise ValidationError("You can not set old password as new one")
        if not self.check_password(old_password):
            raise ValidationError("Wrong old password")
        self.set_password(new_password)
        self.save()

    def _get_reset_token(self) -> (str, str):
        generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(self.pk)),
        token = generator.make_token(self)
        return str(uid[0]), str(token)

    def reset_password(self, token: str, new_password: str) -> None:
        checker = PasswordResetTokenGenerator()
        if not checker.check_token(self, token):
            raise ValidationError("Wrong reset token")
        if not new_password:
            raise ValidationError("New password must be set")
        self.set_password(new_password)
        self.save()

    def request_password_reset(self, initial: bool = False):

        uid, token = self._get_reset_token()
        context = {
            'password_reset_link': PASSWORD_RESET_FRONT_URL.format(
                uid=uid,
                token=token,
                front_url=settings.FRONT_URL
            )
        }

        temp_password = gen_random_password()
        self.set_password(temp_password)
        self.save()
        context.update({"temp_password": temp_password})
        content = loader.render_to_string(INITIAL_PASSWORD_SET, context)

        handler = MailSender()
        handler.send(
            to_email=self.email,
            subject=PASSWORD_RESET_SUBJECT if not initial else INITIAL_PASSWORD_SET_SUBJECT,
            content=content
        )


class UserPersonalInfo(models.Model):
    user = models.OneToOneField('user.User', related_name='personal_info',
                                on_delete=models.CASCADE)

    gender = models.CharField(choices=SEX_CHOICES, max_length=20)

    phone = models.CharField(
        max_length=15,
        unique=False,
        validators=[
            RegexValidator(
                regex="^(\\+\\d{1,3}[- ]?)?\\d{10}$",
                message='Phone has to be numeric and from 11 to 13 characters'
            )
        ])

    birthday = models.DateField(
        validators=[
            MinAgeValidator(4),
            MaxAgeValidator(120)
        ]
    )

    country_of_origin = CountryField()
    city = models.CharField(max_length=255)

    profession = models.CharField(max_length=255, null=True, blank=True)

    about = models.TextField(max_length=2000, null=True, blank=True)
    preferences = models.TextField(max_length=2000, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)
    yuwee_flag = models.BooleanField(default=False)

    class Meta:
        db_table = USER_PERSONAL_INFO_TABLE_NAME
        ordering = ('id',)

    def __str__(self) -> str:
        return f'{self.__class__.__name__} for {self.user}'


class UserExpertise(models.Model):
    title = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = USER_EXPERTISE
        ordering = ('id',)

    def __str__(self) -> str:
        return f'{self.__class__.__name__} {self.title}'


class UserEducation(models.Model):
    user = models.ForeignKey('user.User', related_name='educations', on_delete=models.CASCADE)

    school_name = models.CharField(max_length=255)

    school_start = models.IntegerField(
        validators=[
            MinValueValidator(1920),
        ]
    )
    school_end = models.IntegerField(
        null=True, blank=True,
        validators=[
            MinValueValidator(1920),
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = USER_EDUCATION
        ordering = ('id',)

    def __str__(self) -> str:
        till = self.school_end if self.school_end else 'present'
        return (f'Education of {self.user} at {self.school_name} '
                f'from {self.school_start} to {till}')


class UserSocialInfo(models.Model):
    user = models.OneToOneField('user.User', related_name='social_info',
                                on_delete=models.CASCADE)

    linkedin = models.CharField(max_length=255, null=True, blank=True)
    facebook = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = USER_SOCIAL_INFO_TABLE_NAME
        ordering = ('id',)

    def __str__(self):
        return (
            f'{self.__class__.__name__} | {self.user} | '
            f'linkedin={self.linkedin}, facebook={self.facebook}')


class UserMentorAccount(models.Model):
    user = models.OneToOneField('user.User', related_name='mentor_account',
                                on_delete=models.CASCADE)

    expertise = models.ManyToManyField('user.UserExpertise', related_name='users')

    tags = ArrayField(base_field=models.CharField(max_length=255), max_length=10,
                      default=list)

    status = models.CharField(max_length=255, choices=MENTOR_STATUSES,
                              default=MENTOR_STATUSES.NOT_APPLIED, editable=False)

    checked_by = models.ForeignKey('user.User', related_name='checked_mentor_accounts',
                                   on_delete=models.DO_NOTHING, null=True, blank=True)

    years_of_experience = models.SmallIntegerField()

    about_expertise = models.TextField(max_length=2000)

    achievements = ArrayField(base_field=models.CharField(max_length=255), max_length=25,
                              default=list)

    half_charge = MoneyField(max_digits=10, decimal_places=2,
                             null=True, blank=True, default_currency='INR')
    full_charge = MoneyField(max_digits=10, decimal_places=2,
                             null=True, blank=True, default_currency='INR')

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    can_create_free_workshops = models.BooleanField(default=False)
    top = models.BooleanField(default=False)

    class Meta:
        db_table = USER_MENTOR_ACCOUNT_TABLE_NAME
        ordering = ('-top', 'created_at')

    def save(self, *args, **kwargs):
        adding = self._state.adding
        super().save(*args, **kwargs)
        if adding:
            mentor_group = Group.objects.get(name=GROUP_MENTOR)
            mentor_group.user_set.add(self.user)

    def _create_auto_schedule(self):
        for day, i in DAY_OF_THE_WEEK:
            # creating basic schedule for mentor
            UserMentorSchedule.objects.create(mentor=self, day=day)

    def apply_for_approval(self):
        self.status = MENTOR_STATUSES.WAITING_APPROVAL
        self.save()

    def approve(self):
        self.status = MENTOR_STATUSES.APPROVED
        self.checked_by = get_current_user()
        self.save()

    def reject(self):
        self.status = MENTOR_STATUSES.REJECTED
        self.checked_by = get_current_user()
        self.save()

    @property
    def revenue(self) -> dict:
        begin_at = timezone.now() - timezone.timedelta(days=30)

        workshop_payments = StudyPayment.objects.filter(
            created_at__gte=begin_at,
            transaction__success_at__isnull=False,
            workshop_user__workshop__mentor=self)

        appointment_payments = StudyPayment.objects.filter(
            created_at__gte=begin_at,
            transaction__success_at__isnull=False,
            appointment_user__appointment__mentor=self)

        workshop_rev = workshop_payments.aggregate(s=Sum('transaction__amount')).get('s')
        appointment_rev = appointment_payments.aggregate(s=Sum('transaction__amount')).get('s')

        return {
            'workshops': workshop_rev if workshop_payments else 0.0,
            'appointments': appointment_rev if appointment_rev else 0.0
        }

    def __str__(self) -> str:
        return f'{self.__class__.__name__} for {self.user}'


class UserMentorSchedule(models.Model):
    # TODO restrict creating and deleting from api endpoints
    mentor = models.ForeignKey('user.UserMentorAccount', on_delete=models.CASCADE,
                               related_name='schedules')

    day = DayOfTheWeekField()

    start_at = models.TimeField(default=time(hour=10))
    end_at = models.TimeField(default=time(hour=19))

    timezone = models.CharField(max_length=25, default='UTC')

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    def clean(self) -> None:
        if self.start_at > self.end_at:
            raise ValidationError("start_at can not be bigger than end_at")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        db_table = USER_MENTOR_SCHEDULE_TABLE_NAME
        ordering = ('id',)


class UserYuweeAccount(models.Model):
    user = models.OneToOneField('user.User', related_name='yuwee_account', on_delete=models.CASCADE)
    password = models.CharField(max_length=255)
    yuwee_response_json = JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = USER_YUWEE_REGISTRATION_TABLE_NAME
        ordering = ('id',)

    def __str__(self) -> str:
        return f'{self.__class__.__name__} for {self.user}'

    def auth(self) -> Optional[str]:
        """
        Initiates authorization in Yuwee and returns access token
        :return:
        """
        helper = YuweeHelper()
        return helper.auth_user(self.user)

    def register(self, with_password: str = str()) -> (bool, str):
        """
        Registers user in Yuwee and returns success state and message.
        :return:
        """
        helper = YuweeHelper()
        try:
            helper.register_user(self.user, with_password=with_password)
            return True, 'Success'
        except YuweeUserExistsError:
            return False, 'User already registered'
        except Exception as e:
            return False, str(e)
