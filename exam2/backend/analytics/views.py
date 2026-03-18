from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count, Sum, Q
from django.contrib.auth import get_user_model
from collections import defaultdict

from .models import Test, Question, QuestionAttempt, Topic, StudyPlan
from .serializers import (TestListSerializer, TestDetailSerializer,
                          TestReviewSerializer, QuestionSerializer,
                          StudyPlanSerializer, TopicSerializer)
from . import ml_engine

User = get_user_model()


class DashboardView(APIView):
    """Main dashboard with summary stats."""

    def get(self, request):
        user = request.user
        tests = Test.objects.filter(user=user)
        attempts = QuestionAttempt.objects.filter(test__user=user)

        total_tests = tests.count()
        if total_tests == 0:
            return Response({
                'total_tests': 0,
                'overall_accuracy': 0,
                'avg_score': 0,
                'avg_speed': 0,
                'total_questions_attempted': 0,
                'strong_subjects': [],
                'weak_subjects': [],
                'recent_tests': [],
                'time_management': {'avg_time_per_question': 0, 'efficiency': 0},
            })

        total_attempts = attempts.count()
        correct_attempts = attempts.filter(is_correct=True).count()
        overall_accuracy = round((correct_attempts / total_attempts * 100) if total_attempts > 0 else 0, 1)

        avg_score = tests.aggregate(avg=Avg('score_obtained'))['avg'] or 0
        avg_total = tests.aggregate(avg=Avg('total_marks'))['avg'] or 1
        avg_score_pct = round((avg_score / avg_total * 100), 1)

        avg_time = attempts.aggregate(avg=Avg('time_taken_seconds'))['avg'] or 0

        # Strong vs Weak subjects
        topic_data = ml_engine.classify_topics(attempts)
        strong = [t for t in topic_data if t['classification'] == 'strong']
        weak = [t for t in topic_data if t['classification'] == 'weak']

        # Time management stats
        total_time = attempts.aggregate(s=Sum('time_taken_seconds'))['s'] or 0
        time_per_q = round(total_time / total_attempts, 1) if total_attempts > 0 else 0

        time_used = tests.aggregate(s=Sum('time_taken_minutes'))['s'] or 0
        time_limit = tests.aggregate(s=Sum('time_limit_minutes'))['s'] or 1
        efficiency = round((time_used / time_limit * 100), 1)

        # Recent tests
        recent = TestListSerializer(tests[:5], many=True).data

        return Response({
            'total_tests': total_tests,
            'overall_accuracy': overall_accuracy,
            'avg_score': avg_score_pct,
            'avg_speed': round(avg_time, 1),
            'total_questions_attempted': total_attempts,
            'strong_subjects': [{'name': s['topic_name'], 'accuracy': s['accuracy']} for s in strong[:5]],
            'weak_subjects': [{'name': w['topic_name'], 'accuracy': w['accuracy']} for w in weak[:5]],
            'recent_tests': recent,
            'time_management': {
                'avg_time_per_question': time_per_q,
                'efficiency': efficiency,
            },
        })


# Test Taking Endpoints 

class StartTestView(APIView):
    """Get questions for a new test. Optionally filter by subject or topic."""

    def get(self, request):
        subject = request.query_params.get('subject', None)
        topic_id = request.query_params.get('topic', None)
        count = int(request.query_params.get('count', 15))

        qs = Question.objects.all()
        if subject:
            qs = qs.filter(topic__subject=subject)
        if topic_id:
            qs = qs.filter(topic_id=topic_id)

        questions = list(qs.order_by('?')[:count])
        topics = Topic.objects.all()

        return Response({
            'questions': QuestionSerializer(questions, many=True).data,
            'topics': TopicSerializer(topics, many=True).data,
            'total_marks': sum(q.marks for q in questions),
            'time_limit_minutes': max(10, count * 2),
        })


class SubmitTestView(APIView):
    """Submit a completed test with answers."""

    def post(self, request):
        data = request.data
        answers = data.get('answers', [])
        title = data.get('title', 'Mock Test')
        time_taken_minutes = data.get('time_taken_minutes', 0)

        if not answers:
            return Response({'error': 'No answers provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch all relevant questions
        question_ids = [a['question_id'] for a in answers]
        questions = {q.id: q for q in Question.objects.filter(id__in=question_ids).select_related('topic')}

        total_marks = 0
        score = 0
        attempt_objects = []

        for a in answers:
            q = questions.get(a['question_id'])
            if not q:
                continue

            student_answer = a.get('selected_option', '').upper()
            time_taken = a.get('time_taken_seconds', 60)

            if not student_answer or student_answer == '':
                st = 'skipped'
                is_correct = False
                marks = 0.0
            elif student_answer == q.correct_answer:
                st = 'correct'
                is_correct = True
                marks = q.marks
            else:
                st = 'incorrect'
                is_correct = False
                marks = -q.negative_marks

            total_marks += q.marks
            score += marks

            attempt_objects.append({
                'question': q,
                'topic': q.topic,
                'status': st,
                'is_correct': is_correct,
                'time_taken_seconds': time_taken,
                'difficulty': q.difficulty,
                'marks_obtained': marks,
                'student_answer': student_answer,
            })

        # Create the test
        test = Test.objects.create(
            user=request.user,
            title=title,
            exam_type=request.user.target_exam or 'JEE',
            total_questions=len(attempt_objects),
            total_marks=total_marks,
            score_obtained=max(0, score),
            time_limit_minutes=max(10, len(attempt_objects) * 2),
            time_taken_minutes=time_taken_minutes,
        )

        # Create attempts
        for ao in attempt_objects:
            QuestionAttempt.objects.create(
                test=test,
                question=ao['question'],
                topic=ao['topic'],
                status=ao['status'],
                is_correct=ao['is_correct'],
                time_taken_seconds=ao['time_taken_seconds'],
                difficulty=ao['difficulty'],
                marks_obtained=ao['marks_obtained'],
                student_answer=ao['student_answer'],
            )

        return Response({
            'test_id': test.id,
            'score': max(0, score),
            'total_marks': total_marks,
            'percentage': round(max(0, score) / total_marks * 100, 1) if total_marks > 0 else 0,
            'correct': len([a for a in attempt_objects if a['is_correct']]),
            'incorrect': len([a for a in attempt_objects if a['status'] == 'incorrect']),
            'skipped': len([a for a in attempt_objects if a['status'] == 'skipped']),
            'total': len(attempt_objects),
        }, status=status.HTTP_201_CREATED)


class TestListView(APIView):
    """List all tests."""

    def get(self, request):
        tests = Test.objects.filter(user=request.user)
        serializer = TestListSerializer(tests, many=True)
        return Response(serializer.data)


class TestDetailView(APIView):
    """Get detailed analytics for a specific test."""

    def get(self, request, pk):
        try:
            test = Test.objects.get(pk=pk, user=request.user)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TestDetailSerializer(test)
        return Response(serializer.data)


class TestReviewView(APIView):
    """Get full review for a test including correct answers & explanations."""

    def get(self, request, pk):
        try:
            test = Test.objects.get(pk=pk, user=request.user)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TestReviewSerializer(test)
        return Response(serializer.data)


class TopicIntelligenceView(APIView):
    """Topic-level intelligence: weak / medium / strong classification."""

    def get(self, request):
        attempts = QuestionAttempt.objects.filter(test__user=request.user)
        classifications = ml_engine.classify_topics(attempts)
        return Response({
            'topics': classifications,
            'summary': {
                'weak': len([t for t in classifications if t['classification'] == 'weak']),
                'medium': len([t for t in classifications if t['classification'] == 'medium']),
                'strong': len([t for t in classifications if t['classification'] == 'strong']),
            }
        })


class MistakePatternView(APIView):
    """Mistake pattern analysis."""

    def get(self, request):
        attempts = QuestionAttempt.objects.filter(test__user=request.user)
        patterns = ml_engine.detect_mistake_patterns(attempts)
        return Response(patterns)


class RecommendationView(APIView):
    """AI-powered study recommendations."""

    def get(self, request):
        attempts = QuestionAttempt.objects.filter(test__user=request.user)
        recommendations = ml_engine.generate_recommendations(attempts, request.user)
        return Response({
            'recommendations': recommendations,
            'daily_hours': getattr(request.user, 'daily_study_hours', 4.0),
            'total_topics_to_focus': len(recommendations),
        })


class ProgressView(APIView):
    """Progress over time: score trends, accuracy trends."""

    def get(self, request):
        tests = Test.objects.filter(user=request.user).order_by('date')
        if not tests.exists():
            return Response({
                'score_trend': [],
                'accuracy_trend': [],
                'topic_progress': [],
            })

        score_trend = []
        accuracy_trend = []

        for i, t in enumerate(tests):
            pct = (t.score_obtained / t.total_marks * 100) if t.total_marks > 0 else 0
            correct = t.attempts.filter(is_correct=True).count()
            total = t.total_questions if t.total_questions > 0 else 1
            acc = correct / total * 100

            score_trend.append({
                'test_number': i + 1,
                'test_name': t.title,
                'date': t.date.isoformat(),
                'score': round(pct, 1),
            })
            accuracy_trend.append({
                'test_number': i + 1,
                'test_name': t.title,
                'date': t.date.isoformat(),
                'accuracy': round(acc, 1),
            })

        # Topic progress: compare first-half vs second-half accuracy per topic
        attempts = QuestionAttempt.objects.filter(test__user=request.user).select_related('topic')
        all_attempts = list(attempts.order_by('test__date'))
        mid = len(all_attempts) // 2

        if mid > 0:
            first_half = all_attempts[:mid]
            second_half = all_attempts[mid:]

            topic_first = defaultdict(lambda: {'correct': 0, 'total': 0})
            topic_second = defaultdict(lambda: {'correct': 0, 'total': 0})

            for a in first_half:
                topic_first[a.topic.name]['total'] += 1
                if a.is_correct:
                    topic_first[a.topic.name]['correct'] += 1

            for a in second_half:
                topic_second[a.topic.name]['total'] += 1
                if a.is_correct:
                    topic_second[a.topic.name]['correct'] += 1

            topic_progress = []
            for name in set(list(topic_first.keys()) + list(topic_second.keys())):
                first_acc = (topic_first[name]['correct'] / topic_first[name]['total'] * 100) if topic_first[name]['total'] > 0 else 0
                second_acc = (topic_second[name]['correct'] / topic_second[name]['total'] * 100) if topic_second[name]['total'] > 0 else 0

                topic_progress.append({
                    'topic': name,
                    'earlier_accuracy': round(first_acc, 1),
                    'recent_accuracy': round(second_acc, 1),
                    'improvement': round(second_acc - first_acc, 1),
                })

            topic_progress.sort(key=lambda x: x['improvement'])
        else:
            topic_progress = []

        return Response({
            'score_trend': score_trend,
            'accuracy_trend': accuracy_trend,
            'topic_progress': topic_progress,
        })


class PredictionView(APIView):
    """Predict next exam score."""

    def get(self, request):
        tests = Test.objects.filter(user=request.user)
        prediction = ml_engine.predict_score(tests)
        return Response(prediction)


class ClusterView(APIView):
    """Student performance clustering."""

    def get(self, request):
        user_tests = Test.objects.filter(user=request.user)

        # Get all users' tests for clustering
        all_users = User.objects.all()
        all_users_tests = {}
        for u in all_users:
            u_tests = list(Test.objects.filter(user=u).prefetch_related('attempts'))
            if u_tests:
                all_users_tests[u.id] = u_tests

        result = ml_engine.cluster_student(user_tests, all_users_tests)
        return Response(result)
