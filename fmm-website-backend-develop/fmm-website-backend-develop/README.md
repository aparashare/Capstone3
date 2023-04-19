# fmm_api

FMM api

## Getting Started

Download links:

SSH clone URL: ssh://git@gitlab.com:KonievM/fmm_api.git

HTTPS clone URL: https://gitlab.com/KonievM/fmm_api.git



These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Local setup

+ cloning project
```shell script
git clone https://gitlab.com/KonievM/fmm_api.git
```

+ environment set up

```shell script
cd fmm_api
cp config/docker/djangoapp.env.template config/docker/djangoapp.env
cp config/docker/broker.env.template config/docker/broker.env
cp config/docker/database.env.template config/docker/database.env
```

+ running
```shell script
docker-compose up --build
```

+ applying all migrations
```shell script
docker-compose exec djangoapp python manage.py migrate
```

+ creating superuser
```shell script
docker-compose exec djangoapp python manage.py createsuperuser
```

Congratulations! Your local fmm api is ready to use.

For authentication to work, you have to:
1. go to 0.0.0.0:8000/admin
2. sign in with credentials you provided while creating your superuser
3. go to http://0.0.0.0:8000/admin/oauth2_provider/application/
4. create an application with "Authorization grant type = Resource owner password-based" 
and "Client type = public"
4.1 Copy client id of created application

Example of authentication:
```python
import requests

requests.post('http://0.0.0.0:8000/o/token/', {
    'username': 'maksimkoniev@gmail.com',
    'password': 'password',
    'grant_type': 'password',
    'client_id': 'vNXWX0zfT0SramBd3JPJgofsKZZEO42uT3XAARtQ'
}).json()

"""
Output:
{
    "access_token": "8IAhUo0g0sC83XIxztJ9YrTTQcL1UR",
    "expires_in": 36000,
    "token_type": "Bearer",
    "scope": "read write groups",
    "refresh_token": "2R8Wp10EF38BuDJgvpkollZx58GSqS"
}
"""
```
