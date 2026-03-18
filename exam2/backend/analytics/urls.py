from django.urls import path
from .views import (DashboardView, TestListView, TestDetailView, TestReviewView,
                    StartTestView, SubmitTestView,
                    TopicIntelligenceView, MistakePatternView,
                    RecommendationView, ProgressView, PredictionView,
                    ClusterView)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('tests/', TestListView.as_view(), name='test-list'),
    path('tests/<int:pk>/', TestDetailView.as_view(), name='test-detail'),
    path('tests/<int:pk>/review/', TestReviewView.as_view(), name='test-review'),
    path('start-test/', StartTestView.as_view(), name='start-test'),
    path('submit-test/', SubmitTestView.as_view(), name='submit-test'),
    path('topics/', TopicIntelligenceView.as_view(), name='topics'),
    path('mistakes/', MistakePatternView.as_view(), name='mistakes'),
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
    path('progress/', ProgressView.as_view(), name='progress'),
    path('predictions/', PredictionView.as_view(), name='predictions'),
    path('clusters/', ClusterView.as_view(), name='clusters'),
]
