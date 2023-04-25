import re

from django.contrib.flatpages.forms import FlatpageForm


class CustomFlatpageForm(FlatpageForm):
    def clean_content(self):
        content = self.cleaned_data['content']
        my_regex = re.compile(r'[\n\r\t]')
        content = my_regex.sub(' ', content)

        return content
