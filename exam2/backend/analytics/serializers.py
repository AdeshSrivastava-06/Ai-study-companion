from rest_framework import serializers
from .models import Topic, Test, Question, QuestionAttempt, StudyPlan


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    """Full question with options — for test-taking."""
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_subject = serializers.CharField(source='topic.subject', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'topic', 'topic_name', 'topic_subject',
                  'difficulty', 'option_a', 'option_b', 'option_c', 'option_d',
                  'marks', 'negative_marks']
        # NOTE: correct_answer and explanation NOT included here


class QuestionReviewSerializer(serializers.ModelSerializer):
    """Question with correct answer + explanation — for review after test."""
    topic_name = serializers.CharField(source='topic.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'topic_name', 'difficulty',
                  'option_a', 'option_b', 'option_c', 'option_d',
                  'correct_answer', 'explanation', 'marks', 'negative_marks']


class QuestionAttemptSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_subject = serializers.CharField(source='topic.subject', read_only=True)

    class Meta:
        model = QuestionAttempt
        fields = ['id', 'question', 'topic', 'topic_name', 'topic_subject', 'status',
                  'is_correct', 'time_taken_seconds', 'difficulty',
                  'marks_obtained', 'student_answer']


class QuestionAttemptReviewSerializer(serializers.ModelSerializer):
    """Attempt with full question details for review."""
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    question_detail = QuestionReviewSerializer(source='question', read_only=True)

    class Meta:
        model = QuestionAttempt
        fields = ['id', 'question', 'question_detail', 'topic_name', 'status',
                  'is_correct', 'time_taken_seconds', 'difficulty',
                  'marks_obtained', 'student_answer']


class TestListSerializer(serializers.ModelSerializer):
    accuracy = serializers.FloatField(read_only=True)
    percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'title', 'exam_type', 'date', 'total_questions',
                  'total_marks', 'score_obtained', 'time_limit_minutes',
                  'time_taken_minutes', 'accuracy', 'percentage']


class TestDetailSerializer(serializers.ModelSerializer):
    accuracy = serializers.FloatField(read_only=True)
    percentage = serializers.FloatField(read_only=True)
    attempts = QuestionAttemptSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'title', 'exam_type', 'date', 'total_questions',
                  'total_marks', 'score_obtained', 'time_limit_minutes',
                  'time_taken_minutes', 'accuracy', 'percentage', 'attempts']


class TestReviewSerializer(serializers.ModelSerializer):
    """Full test review with correct answers."""
    accuracy = serializers.FloatField(read_only=True)
    percentage = serializers.FloatField(read_only=True)
    attempts = QuestionAttemptReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ['id', 'title', 'exam_type', 'date', 'total_questions',
                  'total_marks', 'score_obtained', 'time_limit_minutes',
                  'time_taken_minutes', 'accuracy', 'percentage', 'attempts']


class StudyPlanSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_subject = serializers.CharField(source='topic.subject', read_only=True)

    class Meta:
        model = StudyPlan
        fields = ['id', 'topic', 'topic_name', 'topic_subject', 'priority',
                  'recommended_hours', 'reason', 'practice_questions_needed',
                  'created_at']
