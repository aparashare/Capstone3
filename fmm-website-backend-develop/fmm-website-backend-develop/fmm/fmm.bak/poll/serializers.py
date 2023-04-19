from rest_framework import serializers
from fmm.poll.models import PollAnswer, Poll
from django.db.models import Count


class PollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poll
        fields = '__all__'


class PollDetailSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = '__all__'

    # TODO check that it serializes fine
    def get_options(self, instance):
        answers = PollAnswer.objects.filter(poll=instance)
        results = list(answers.values('answer').annotate(total=Count('answer')).order_by('total'))
        all_answers = [x["answer"] for x in results]
        for option in instance.options:
            if option not in all_answers:
                results.append({"answer": option, "total": 0})

        return results


class PollAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollAnswer
        fields = '__all__'
