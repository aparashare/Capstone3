from django.contrib.auth import forms, get_user_model
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _
from django import forms as django_forms

from .models import UserPersonalInfo
from fmm.utils.yuwee import YuweeHelper
from fmm.utils.exceptions import YuweeUserExistsError

User = get_user_model()


class UserChangeForm(forms.UserChangeForm):
    class Meta(forms.UserChangeForm.Meta):
        model = User


class UserCreationForm(forms.UserCreationForm):

    error_message = forms.UserCreationForm.error_messages.update(
        {"duplicate_username": _("This username has already been taken.")}
    )

    class Meta(forms.UserCreationForm.Meta):
        model = User

    def clean_username(self):
        username = self.cleaned_data["username"]

        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username

        raise ValidationError(self.error_messages["duplicate_username"])


class YuweeRegisterForm(django_forms.ModelForm):

    class Meta:
        model = UserPersonalInfo
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        if 'yuwee_flag' in cleaned_data:
            if cleaned_data['yuwee_flag']:
                helper = YuweeHelper()
                try:
                    yuwee = helper.register_user(user=self.instance.user)
                    if not yuwee:
                        cleaned_data['yuwee_flag'] = False
                except YuweeUserExistsError:
                    cleaned_data['yuwee_flag'] = True
                except Exception:
                    cleaned_data['yuwee_flag'] = False
            else:
                cleaned_data['yuwee_flag'] = True
        return cleaned_data
