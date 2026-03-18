from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model for exam analytics platform."""
    target_exam = models.CharField(max_length=50, blank=True, default='JEE')
    target_score = models.FloatField(default=80.0)
    daily_study_hours = models.FloatField(default=4.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.target_exam})"
