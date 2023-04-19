NUMERIC = ['exact', 'in', 'gte', 'lte', 'gt', 'lt', 'isnull']
DATETIME = ['exact', 'gte', 'lte', 'gt', 'lt', 'isnull']
DURATION = ['exact', 'gte', 'lte', 'gt', 'lt', 'isnull']
BOOL = ['exact', 'isnull']
TEXT = ['exact', 'contains', 'icontains', 'endswith', 'startswith', 'isnull']

# adding this as we use PostgreSQL. But it mey be slow to use
# https://docs.djangoproject.com/en/3.0/ref/contrib/postgres/lookups/
TEXT.extend([
    'trigram_similar',
    'unaccent'  # can be mixed with other lookups as first_name__unaccent__startswith
])
