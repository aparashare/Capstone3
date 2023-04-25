import django_filters
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import CustomGroupPermission, get_required_groups
from fmm.poll.filters import PollAnswerFilter, PollFilter
from fmm.poll.models import PollAnswer, Poll
from fmm.poll.serializers import PollSerializer, PollAnswerSerializer, PollDetailSerializer
from fmm.utils.constants.permissions import POLL_ANSWER, POLL
from fmm.utils.helper import METHOD_POST


class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all()
    filter_class = PollFilter
    serializer_class = PollSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(POLL)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PollDetailSerializer
        else:
            return PollSerializer

    @action(detail=True,
            methods=[METHOD_POST])
    def vote(self, request, pk):
        poll = get_object_or_404(klass=Poll, pk=pk)
        poll.vote(answer=request.data.get('answer'))
        return Response(PollDetailSerializer(poll).data)


class PollAnswerViewSet(viewsets.ModelViewSet):
    queryset = PollAnswer.objects.all()
    filter_class = PollAnswerFilter
    serializer_class = PollAnswerSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,
                       filters.OrderingFilter)
    permission_classes = [
        permissions.IsAuthenticated,
        CustomGroupPermission
    ]
    required_groups = get_required_groups(POLL_ANSWER)
