from rest_framework import filters
from django.conf import settings
from django.contrib.flatpages.models import FlatPage
from django.http import Http404, HttpResponsePermanentRedirect
from django.shortcuts import get_object_or_404
from django.utils.safestring import mark_safe
from rest_framework import mixins, permissions, response, status, viewsets
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend

from . import models, serializers


class FaqViewSet(mixins.RetrieveModelMixin,
                 mixins.ListModelMixin,
                 viewsets.GenericViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = models.Faq.objects.filter(status=True)
    serializer_class = serializers.FaqSerializer


def flatpage(request, url):
    """
    Public interface to the flat page view.
    Models: `flatpages.flatpages`
    Templates: Uses the template defined by the ``template_name`` field,
        or :template:`flatpages/default.html` if template_name is not defined.
    Context:
        flatpage
            `flatpages.flatpages` object
    """
    if not url.startswith('/'):
        url = '/' + url
    try:
        f = get_object_or_404(FlatPage, url=url)
    except Http404:
        if not url.endswith('/') and settings.APPEND_SLASH:
            url += '/'
            f = get_object_or_404(FlatPage, url=url)
            return HttpResponsePermanentRedirect('%s/' % request.path)
        else:
            raise
    return render_flatpage(request, f)


@api_view(['GET'])
def render_flatpage(request, f):
    """
    Internal interface to the flat page view.
    """
    # If registration is required for accessing this page, and the user isn't
    # logged in, return 403.
    if f.registration_required and not request.user.is_authenticated:
        return response.Response({'detail': 'Acess forbidden!'}, status=status.HTTP_403_FORBIDDEN)

    # To avoid having to always use the "|safe" filter in flatpage templates,
    # mark the title and content as already safe (since they are raw HTML
    # content in the first place).
    f.title = mark_safe(f.title)
    f.content = mark_safe(f.content)

    return response.Response({'title': f.title, 'content': f.content}, status=status.HTTP_200_OK)


class MetaDataViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = models.MetaData.objects.all().order_by("-created_at")
    serializer_class = serializers.MetaDataSerializer
    filter_backends = (filters.OrderingFilter, filters.SearchFilter,
                       DjangoFilterBackend)
    filter_fields = ["title"]
