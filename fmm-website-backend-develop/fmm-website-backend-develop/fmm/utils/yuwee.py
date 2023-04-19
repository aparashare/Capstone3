import base64
from typing import TYPE_CHECKING, Optional

import requests
from cryptography.hazmat.backends import default_backend as crypto_default_backend
from cryptography.hazmat.primitives import serialization as crypto_serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from django.conf import settings

from fmm.utils.helper import gen_random_string
from .exceptions import YuweeUserExistsError

if TYPE_CHECKING:
    from fmm.user.models import User  # noqa


class YuweeHelper:
    AUTH_URL = 'https://connect.yuwee.com/api_v2/oauth2/token/'
    SIGNUP_URL = 'https://connect.yuwee.com/api_v2/user/signup/'

    def __init__(self):
        self.client_id = settings.YUWEE_CLIENT_ID
        self.auth_token = settings.YUWEE_AUTH_TOKEN

    def create_rsa_keys(self) -> (str, str):
        key = rsa.generate_private_key(
            backend=crypto_default_backend(),
            public_exponent=65537,
            key_size=2048
        )
        private_key = key.private_bytes(
            crypto_serialization.Encoding.PEM,
            crypto_serialization.PrivateFormat.PKCS8,
            crypto_serialization.NoEncryption())
        public_key = key.public_key().public_bytes(
            crypto_serialization.Encoding.OpenSSH,
            crypto_serialization.PublicFormat.OpenSSH
        )
        return private_key.decode("utf-8"), public_key.decode("utf-8")

    def auth_user(self, user: 'User') -> Optional[str]:
        from fmm.user.models import UserYuweeAccount  # noqa

        if not UserYuweeAccount.objects.filter(user=user).exists():
            raise PermissionError("User is not registered in Yuwee")

        private_key, public_key = self.create_rsa_keys()

        headers = {
            'Authorization': f'Basic {self.auth_token}'
        }
        data = {
            "grant_type": "password",
            "username": user.email,
            "password": user.yuwee_account.password,
            "accountId": self.client_id,
            "deviceCategory": "web",
            "publicKey": public_key,
            "privateKey": private_key,
            "isRSAKeyGeneratedFromFE": 1
        }
        response = requests.post(url=self.AUTH_URL, data=data, headers=headers).json()
        if response.get("status") == "ERROR":
            return None
        else:
            return response.get("access_token")

    def register_user(self, user: 'User', with_password: str = str()) -> bool:
        from fmm.user.models import UserYuweeAccount  # noqa

        if UserYuweeAccount.objects.filter(user=user).exists():
            raise YuweeUserExistsError()

        with_password = with_password if with_password else gen_random_string(16)

        data = {
            "email": user.email,
            "mobile": user.personal_info.phone,
            "name": f"{user.first_name} {user.last_name}",
            "password": with_password,
            "userCreatedBy": "End User",
            "role": "End User",
            "isAdmin": "false"
        }

        encode = base64.b64encode(
            f"{self.client_id}:{self.auth_token}".encode("utf-8")).decode("utf-8")
        response = requests.post(
            url=self.SIGNUP_URL,
            data=data,
            headers={'Authorization': f'Basic {encode}'}
        ).json()

        status_key = response.get('status')

        if status_key and status_key == "error":
            print(response)
            return False
        else:
            UserYuweeAccount.objects.create(
                user=user,
                password=with_password,
                yuwee_response_json=response)
            # change yuwee flag into user`s personal info
            personal_info = user.personal_info
            personal_info.yuwee_flag = True
            personal_info.save()
            return True
