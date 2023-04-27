#################
### variables ###
#################

ARG PYTHON_VERSION=3.7

#########################
### build environment ###
#########################

FROM python:${PYTHON_VERSION}

RUN set -ex && mkdir -p /opt/djangoapp/src

COPY Pipfile Pipfile.lock /opt/djangoapp/src/

COPY requirements.txt /opt/djangoapp/src/


WORKDIR /opt/djangoapp/src

# RUN set -ex && pip install pipenv==2018.11.26 && \
#         pipenv install --dev --deploy --system --ignore-pipfile

RUN set -ex && pip install -r requirements.txt

COPY . /opt/djangoapp/src

EXPOSE 8000

CMD ["gunicorn", \
        "--bind", ":8000", \
        "--workers", "3", \
        "config.wsgi:application"]