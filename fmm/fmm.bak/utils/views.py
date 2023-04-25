from django_countries.data import COUNTRIES
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from djmoney.models.fields import CURRENCY_CHOICES

from fmm.utils.helper import METHOD_GET


class HelperView(viewsets.ViewSet):
    @action(detail=False,
            methods=[METHOD_GET])
    def countries(self, request):
        return Response(COUNTRIES)

    @action(detail=False,
            methods=[METHOD_GET])
    def currencies(self, request):
        resp = dict()
        [resp.update({curr[0]: curr[1]}) for curr in CURRENCY_CHOICES]
        return Response(resp)
