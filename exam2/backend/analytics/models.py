from django.db import models
from django.conf import settings


class Topic(models.Model):
    """A concept/topic that questions can be tagged with."""
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=100, default='General')
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'topics'
        ordering = ['subject', 'name']

    def __str__(self):
        return f"{self.subject} → {self.name}"


class Test(models.Model):
    """A mock test attempted by a student."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=50, default='JEE')
    date = models.DateTimeField(auto_now_add=True)
    total_questions = models.IntegerField(default=0)
    total_marks = models.FloatField(default=0)
    score_obtained = models.FloatField(default=0)
    time_limit_minutes = models.IntegerField(default=180)
    time_taken_minutes = models.IntegerField(default=0)

    class Meta:
        db_table = 'tests'
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} — {self.user.username} ({self.score_obtained}/{self.total_marks})"

    @property
    def accuracy(self):
        if self.total_questions == 0:
            return 0
        correct = self.attempts.filter(is_correct=True).count()
        return round((correct / self.total_questions) * 100, 1)

    @property
    def percentage(self):
        if self.total_marks == 0:
            return 0
        return round((self.score_obtained / self.total_marks) * 100, 1)


class Question(models.Model):
    """A question in the question bank."""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    text = models.TextField()
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    option_a = models.CharField(max_length=500, default='')
    option_b = models.CharField(max_length=500, default='')
    option_c = models.CharField(max_length=500, default='')
    option_d = models.CharField(max_length=500, default='')
    correct_answer = models.CharField(max_length=1, default='A')  # A, B, C, D
    explanation = models.TextField(blank=True, default='')
    marks = models.FloatField(default=4.0)
    negative_marks = models.FloatField(default=1.0)

    class Meta:
        db_table = 'questions'

    def __str__(self):
        return f"Q({self.topic.name}/{self.difficulty}): {self.text[:50]}"


class QuestionAttempt(models.Model):
    """A student's attempt at a single question within a test."""
    STATUS_CHOICES = [
        ('correct', 'Correct'),
        ('incorrect', 'Incorrect'),
        ('skipped', 'Skipped'),
    ]
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='attempts', null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='attempts')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='incorrect')
    is_correct = models.BooleanField(default=False)
    time_taken_seconds = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=10, default='medium')
    marks_obtained = models.FloatField(default=0)
    student_answer = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'question_attempts'

    def __str__(self):
        return f"{self.test.user.username} | {self.topic.name} | {self.status}"


class StudyPlan(models.Model):
    """AI-generated study plan entry."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    priority = models.IntegerField(default=1)  # 1=highest
    recommended_hours = models.FloatField(default=1.0)
    reason = models.TextField(blank=True)
    practice_questions_needed = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'study_plans'
        ordering = ['priority']

    def __str__(self):
        return f"{self.user.username} | Priority {self.priority}: {self.topic.name}"
