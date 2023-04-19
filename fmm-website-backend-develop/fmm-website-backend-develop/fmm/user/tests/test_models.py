from django.contrib.auth.models import Group
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

import string
import uuid
import random
from datetime import datetime
from django.test import TestCase
from rest_framework import status


factory = APIRequestFactory()

User = get_user_model()


def randomString(stringLength=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))


class LoginMixin:
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="superuser",
            email=randomString() + '@example.local',
            password='password1234'
        )
        for i in ['Admin', 'Mentor', 'User']:
            Group.objects.create(name=i)
        self.api_client = APIClient()
        self.api_client.force_authenticate(user=self.admin_user)


class CompareMixin:
    def data_compare(self, data=None, to_compare=None):
        assert data is not None
        assert to_compare is not None

        if isinstance(data, str):
            self.assertEqual(data, str(to_compare))
        elif isinstance(data, uuid.UUID):
            self.data_compare(str(data), str(to_compare))
        elif isinstance(data, datetime):
            self.assertEqual(data, datetime.strptime(to_compare, "%Y-%m-%dT%H:%M:%S.%fZ"))
        elif isinstance(data, dict):
            for key, _ in data.items():
                if key == "password":
                    continue
                self.data_compare(data[key], to_compare[key])
        elif isinstance(data, float):
            self.assertEqual(data, to_compare)
        elif isinstance(data, int):
            self.assertEqual(int(data), int(to_compare))
        elif isinstance(data, list):
            if isinstance(to_compare, set):
                to_compare = list(to_compare)
            for index, item in enumerate(data):
                self.data_compare(item, to_compare[index])


REGISTER_URL = 'http://0.0.0.0:8000/v0/users/register/'


class UserApiTests(LoginMixin, CompareMixin, TestCase):

    def test_create_user(self):
        user_data = {
            "username": "alex",
            "first_name": "Alex",
            "last_name": "Smirnov",
            "email": randomString() + "@project.local",
            "password": "django1234",
        }

        result = self.api_client.post(REGISTER_URL, user_data, format="json")
        self.assertEqual(result.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(result.data['id'])
        self.assertIsInstance(result.data['id'], int)
        super().data_compare(user_data, result.data)
