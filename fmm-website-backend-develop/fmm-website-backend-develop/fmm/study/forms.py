from django import forms

from .models import WorkshopCoupon


class WorkshopCouponAdminForm(forms.ModelForm):

    class Meta:
        model = WorkshopCoupon
        fields = '__all__'

    def clean_discount(self):
        if self.cleaned_data["discount"] < 1 or \
                self.cleaned_data["discount"] >= 100:
            raise forms.ValidationError("You need set discount between 1 and 100.")
        return self.cleaned_data["discount"]
