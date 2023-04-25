
from django_filters.rest_framework import FilterSet, BaseInFilter, DateTimeFilter, CharFilter


class BaseFilter(FilterSet):
    id = BaseInFilter(field_name='id', lookup_expr='in')

    created_at__gte = DateTimeFilter(field_name='created_at', lookup_expr='gte')
    updated_at__gte = DateTimeFilter(field_name='updated_at', lookup_expr='gte')

    created_at__lte = DateTimeFilter(field_name='created_at', lookup_expr='lte')
    updated_at__lte = DateTimeFilter(field_name='updated_at', lookup_expr='lte')

    class Meta:
        abstract = True
        fields = '__all__'


class CharArrayFilter(BaseInFilter, CharFilter):
    pass
