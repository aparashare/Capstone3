from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views import defaults as default_views
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import SimpleRouter
from fmm.utils.views import HelperView
from fmm.utils.constants.endpoints import API_VERSION

schema_view = get_schema_view(
    openapi.Info(
        title="FMM API",
        default_version='v0',
        description="API description will be here",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Django Admin, use {% url 'admin:index' %}
    path(settings.ADMIN_URL, admin.site.urls),
    re_path(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),

    # drf_yasg
    url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0),
        name='schema-json'),
    url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

additional_router = SimpleRouter()
additional_router.register('helper', HelperView, 'helper')

urlpatterns += [
    # path('api-auth/', include('rest_framework.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.lead.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.testimonial.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.subscription.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.review.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.poll.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.payment.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.study.urls')),
    re_path(r'^{}/'.format(API_VERSION), include('fmm.user.urls')),
    re_path(r'^{}/pages/'.format(API_VERSION), include('fmm.pages.urls')),
    re_path(r'^{}/notes/'.format(API_VERSION), include('fmm.notes.urls')),

    # helper
    re_path(r'^{}/'.format(API_VERSION), include(additional_router.urls)),
]

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
