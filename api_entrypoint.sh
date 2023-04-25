#!/usr/bin/env sh

gunicorn --bind :8000 --workers 3 config.wsgi:application --reload
