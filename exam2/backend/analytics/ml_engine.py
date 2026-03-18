
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from collections import defaultdict

#WEAK TOPIC CLASSIFIER

def classify_topics(attempts_qs):
    """
    Classify each topic as weak / medium / strong based on attempt data.
    Uses RandomForest when enough data, else rule-based fallback.

    Returns: list of dicts with topic info and classification.
    """
    if not attempts_qs.exists():
        return []

    # Aggregate per-topic stats
    topic_stats = defaultdict(lambda: {
        'total': 0, 'correct': 0, 'total_time': 0,
        'difficulties': [], 'topic_name': '', 'subject': ''
    })

    for a in attempts_qs.select_related('topic'):
        tid = a.topic_id
        topic_stats[tid]['total'] += 1
        topic_stats[tid]['correct'] += (1 if a.is_correct else 0)
        topic_stats[tid]['total_time'] += a.time_taken_seconds
        topic_stats[tid]['difficulties'].append(
            {'easy': 1, 'medium': 2, 'hard': 3}.get(a.difficulty, 2)
        )
        topic_stats[tid]['topic_name'] = a.topic.name
        topic_stats[tid]['subject'] = a.topic.subject

    results = []
    features_list = []
    topic_ids = []

    for tid, stats in topic_stats.items():
        accuracy = (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
        avg_time = (stats['total_time'] / stats['total']) if stats['total'] > 0 else 0
        avg_diff = np.mean(stats['difficulties']) if stats['difficulties'] else 2
        attempt_count = stats['total']

        features_list.append([accuracy, avg_time, attempt_count, avg_diff])
        topic_ids.append(tid)

        results.append({
            'topic_id': tid,
            'topic_name': stats['topic_name'],
            'subject': stats['subject'],
            'accuracy': round(accuracy, 1),
            'avg_time_seconds': round(avg_time, 1),
            'attempt_count': attempt_count,
            'avg_difficulty': round(avg_diff, 2),
            'classification': 'medium',  # default
            'confidence': 0.5,
        })

    if len(features_list) >= 3:
        # Use ML classification
        X = np.array(features_list)
        # Generate labels based on accuracy thresholds for training
        labels = []
        for f in features_list:
            acc = f[0]
            if acc < 40:
                labels.append(0)  # weak
            elif acc < 70:
                labels.append(1)  # medium
            else:
                labels.append(2)  # strong

        label_map = {0: 'weak', 1: 'medium', 2: 'strong'}

        # If we have at least 2 distinct classes, train RF
        unique_labels = set(labels)
        if len(unique_labels) >= 2:
            try:
                clf = RandomForestClassifier(n_estimators=50, random_state=42)
                clf.fit(X, labels)
                predictions = clf.predict(X)
                probas = clf.predict_proba(X)

                for i, pred in enumerate(predictions):
                    results[i]['classification'] = label_map[pred]
                    results[i]['confidence'] = round(float(probas[i].max()), 2)
            except Exception:
                # Fallback to rule-based
                for i, f in enumerate(features_list):
                    results[i]['classification'] = label_map[labels[i]]
        else:
            for i in range(len(results)):
                results[i]['classification'] = label_map[labels[i]]
    else:
        # Simple rule-based for few topics
        for i, f in enumerate(features_list):
            acc = f[0]
            if acc < 40:
                results[i]['classification'] = 'weak'
            elif acc < 70:
                results[i]['classification'] = 'medium'
            else:
                results[i]['classification'] = 'strong'

    # Sort: weak first, then medium, then strong
    order = {'weak': 0, 'medium': 1, 'strong': 2}
    results.sort(key=lambda x: order.get(x['classification'], 1))

    return results



#PERFORMANCE PREDICTION


def predict_score(tests_qs):
    """
    Predict the student's next exam score using GradientBoosting.
    Uses test-level features: score_pct, accuracy, time_efficiency, test_number.

    Returns: dict with predicted_score, confidence, trend.
    """
    tests = list(tests_qs.order_by('date'))
    if len(tests) < 2:
        if tests:
            last = tests[-1]
            pct = (last.score_obtained / last.total_marks * 100) if last.total_marks > 0 else 0
            return {
                'predicted_score': round(pct, 1),
                'confidence': 0.3,
                'trend': 'stable',
                'test_count': len(tests),
                'history': [round(pct, 1)],
            }
        return {'predicted_score': 0, 'confidence': 0, 'trend': 'insufficient_data',
                'test_count': 0, 'history': []}

    features = []
    scores = []
    history = []

    for i, t in enumerate(tests):
        pct = (t.score_obtained / t.total_marks * 100) if t.total_marks > 0 else 0
        time_eff = (t.time_taken_minutes / t.time_limit_minutes) if t.time_limit_minutes > 0 else 1
        correct = t.attempts.filter(is_correct=True).count()
        total = t.total_questions if t.total_questions > 0 else 1
        acc = correct / total * 100

        features.append([i + 1, acc, time_eff, t.total_questions])
        scores.append(pct)
        history.append(round(pct, 1))

    X = np.array(features)
    y = np.array(scores)

    try:
        model = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
        model.fit(X, y)

        # Predict next test
        next_features = np.array([[len(tests) + 1, features[-1][1], features[-1][2], features[-1][3]]])
        predicted = float(model.predict(next_features)[0])
        predicted = max(0, min(100, predicted))  # clamp 0-100

        # Determine trend
        if len(scores) >= 3:
            recent_avg = np.mean(scores[-3:])
            older_avg = np.mean(scores[:-3]) if len(scores) > 3 else scores[0]
            if recent_avg > older_avg + 5:
                trend = 'improving'
            elif recent_avg < older_avg - 5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable' if scores[-1] >= scores[0] else 'declining'

        return {
            'predicted_score': round(predicted, 1),
            'confidence': round(min(0.9, 0.3 + len(tests) * 0.1), 2),
            'trend': trend,
            'test_count': len(tests),
            'history': history,
        }
    except Exception:
        avg = np.mean(scores)
        return {
            'predicted_score': round(avg, 1),
            'confidence': 0.3,
            'trend': 'stable',
            'test_count': len(tests),
            'history': history,
        }



def detect_mistake_patterns(attempts_qs):
    """
    Classify each incorrect attempt into a mistake category:
    - conceptual: repeated mistakes on same topic
    - silly: fast answer + wrong on easy question
    - time_pressure: slow answer + wrong
    - guessing: very fast answer + wrong on hard question

    Returns: dict with categorized mistakes and summary stats.
    """
    incorrect = attempts_qs.filter(is_correct=False).select_related('topic')
    if not incorrect.exists():
        return {
            'total_mistakes': 0,
            'patterns': {},
            'summary': [],
            'top_mistake_topics': [],
        }

    # Compute median time for baseline
    times = list(incorrect.values_list('time_taken_seconds', flat=True))
    median_time = np.median(times) if times else 60

    # Count mistakes per topic for conceptual detection
    topic_mistake_count = defaultdict(int)
    for a in incorrect:
        topic_mistake_count[a.topic.name] += 1

    patterns = {
        'conceptual': [],
        'silly': [],
        'time_pressure': [],
        'guessing': [],
    }

    for a in incorrect:
        entry = {
            'topic': a.topic.name,
            'subject': a.topic.subject,
            'difficulty': a.difficulty,
            'time_taken': a.time_taken_seconds,
        }

        # Classification logic
        if topic_mistake_count[a.topic.name] >= 3:
            patterns['conceptual'].append(entry)
        elif a.difficulty == 'easy' and a.time_taken_seconds < median_time * 0.5:
            patterns['silly'].append(entry)
        elif a.time_taken_seconds > median_time * 1.5:
            patterns['time_pressure'].append(entry)
        elif a.difficulty == 'hard' and a.time_taken_seconds < median_time * 0.3:
            patterns['guessing'].append(entry)
        else:
            # Default to conceptual if repeated, else silly
            if topic_mistake_count[a.topic.name] >= 2:
                patterns['conceptual'].append(entry)
            else:
                patterns['silly'].append(entry)

    summary = [
        {'type': 'conceptual', 'count': len(patterns['conceptual']),
         'label': 'Conceptual Errors', 'description': 'Repeated mistakes in the same topic — need deeper understanding',
         'color': '#ef4444'},
        {'type': 'silly', 'count': len(patterns['silly']),
         'label': 'Silly Mistakes', 'description': 'Quick wrong answers on easy questions — need more care',
         'color': '#f59e0b'},
        {'type': 'time_pressure', 'count': len(patterns['time_pressure']),
         'label': 'Time Pressure Errors', 'description': 'Too much time spent leading to wrong answers',
         'color': '#3b82f6'},
        {'type': 'guessing', 'count': len(patterns['guessing']),
         'label': 'Guessing', 'description': 'Very fast wrong answers on hard questions — likely guessed',
         'color': '#8b5cf6'},
    ]

    # Top mistake topics
    sorted_topics = sorted(topic_mistake_count.items(), key=lambda x: -x[1])
    top_topics = [{'topic': t, 'mistakes': c} for t, c in sorted_topics[:5]]

    return {
        'total_mistakes': incorrect.count(),
        'patterns': {k: len(v) for k, v in patterns.items()},
        'summary': summary,
        'top_mistake_topics': top_topics,
    }


# STUDENT CLUSTERING


def cluster_student(user_tests, all_users_tests):
    """
    Cluster student into performance groups using KMeans:
    - Fast but Inaccurate
    - Slow but Accurate
    - Balanced Performer

    Returns: dict with cluster label and stats.
    """
    if not user_tests.exists() or len(all_users_tests) < 3:
        # Compute basic stats for current user
        tests = list(user_tests)
        if not tests:
            return {'cluster': 'Needs More Data', 'speed_score': 0, 'accuracy_score': 0,
                    'cluster_id': -1, 'all_clusters': []}

        accuracies = []
        speeds = []
        for t in tests:
            correct = t.attempts.filter(is_correct=True).count()
            total = t.total_questions if t.total_questions > 0 else 1
            accuracies.append(correct / total * 100)
            speed = (t.time_taken_minutes / t.time_limit_minutes * 100) if t.time_limit_minutes > 0 else 100
            speeds.append(speed)

        avg_acc = np.mean(accuracies)
        avg_speed = np.mean(speeds)

        if avg_acc > 70 and avg_speed < 80:
            cluster = 'Balanced Performer'
        elif avg_acc > 60:
            cluster = 'Slow but Accurate'
        else:
            cluster = 'Fast but Inaccurate'

        return {
            'cluster': cluster,
            'speed_score': round(avg_speed, 1),
            'accuracy_score': round(avg_acc, 1),
            'cluster_id': 0,
            'all_clusters': [
                {'name': 'Fast but Inaccurate', 'description': 'Quick answers but lower accuracy'},
                {'name': 'Slow but Accurate', 'description': 'Takes time but gets more right'},
                {'name': 'Balanced Performer', 'description': 'Good speed and accuracy balance'},
            ]
        }

    # Build feature matrix for all users
    user_features = {}
    for user_id, tests in all_users_tests.items():
        accs = []
        spds = []
        for t in tests:
            correct = t.attempts.filter(is_correct=True).count()
            total = t.total_questions if t.total_questions > 0 else 1
            accs.append(correct / total * 100)
            spd = (t.time_taken_minutes / t.time_limit_minutes * 100) if t.time_limit_minutes > 0 else 100
            spds.append(spd)
        user_features[user_id] = [np.mean(accs), np.mean(spds)]

    if len(user_features) < 3:
        avg_acc, avg_speed = user_features.get(list(user_features.keys())[0], [50, 50])
        return {
            'cluster': 'Balanced Performer',
            'speed_score': round(avg_speed, 1),
            'accuracy_score': round(avg_acc, 1),
            'cluster_id': 0,
            'all_clusters': [],
        }

    user_ids = list(user_features.keys())
    X = np.array([user_features[uid] for uid in user_ids])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    n_clusters = min(3, len(X))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Map cluster centers to labels
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    cluster_names = {}
    sorted_by_acc = sorted(range(n_clusters), key=lambda i: centers[i][0])

    name_options = ['Fast but Inaccurate', 'Balanced Performer', 'Slow but Accurate']
    if n_clusters == 3:
        cluster_names = {sorted_by_acc[0]: name_options[0],
                         sorted_by_acc[1]: name_options[1],
                         sorted_by_acc[2]: name_options[2]}
    else:
        for i in range(n_clusters):
            cluster_names[sorted_by_acc[i]] = name_options[min(i, 2)]

    # Find current user
    current_user_id = list(user_tests.values_list('user_id', flat=True).distinct())[0]
    idx = user_ids.index(current_user_id) if current_user_id in user_ids else 0

    return {
        'cluster': cluster_names.get(labels[idx], 'Balanced Performer'),
        'speed_score': round(float(X[idx][1]), 1),
        'accuracy_score': round(float(X[idx][0]), 1),
        'cluster_id': int(labels[idx]),
        'all_clusters': [
            {'name': cluster_names.get(i, f'Group {i}'),
             'count': int(np.sum(labels == i)),
             'avg_accuracy': round(float(centers[i][0]), 1),
             'avg_speed': round(float(centers[i][1]), 1)}
            for i in range(n_clusters)
        ],
    }



# STUDY RECOMMENDATION ENGINE


def generate_recommendations(attempts_qs, user):
    """
    Generate personalized study recommendations based on:
    - Topic accuracy (priority to weak topics)
    - Mistake frequency
    - Time management issues
    - User's daily study hours budget

    Returns: list of recommendation dicts.
    """
    if not attempts_qs.exists():
        return []

    topic_classifications = classify_topics(attempts_qs)
    mistake_data = detect_mistake_patterns(attempts_qs)

    daily_hours = getattr(user, 'daily_study_hours', 4.0) or 4.0
    recommendations = []

    # Build mistake count lookup
    mistake_topic_counts = {m['topic']: m['mistakes']
                            for m in mistake_data.get('top_mistake_topics', [])}

    weak_topics = [t for t in topic_classifications if t['classification'] == 'weak']
    medium_topics = [t for t in topic_classifications if t['classification'] == 'medium']

    priority = 1

    # Priority 1: Weak topics with high mistake count
    for topic in weak_topics:
        mistakes = mistake_topic_counts.get(topic['topic_name'], 0)
        hours = min(2.0, daily_hours * 0.3)

        if topic['accuracy'] < 30:
            reason = f"Critical weakness: only {topic['accuracy']}% accuracy. Focus on fundamentals."
            questions = 20
        else:
            reason = f"Below target at {topic['accuracy']}% accuracy with {mistakes} repeated mistakes."
            questions = 15

        recommendations.append({
            'topic_id': topic['topic_id'],
            'topic_name': topic['topic_name'],
            'subject': topic['subject'],
            'priority': priority,
            'recommended_hours': round(hours, 1),
            'reason': reason,
            'practice_questions': questions,
            'accuracy': topic['accuracy'],
            'classification': 'weak',
            'action': 'Revise theory + solve practice problems',
        })
        priority += 1

    # Priority 2: Medium topics that are declining
    for topic in medium_topics:
        mistakes = mistake_topic_counts.get(topic['topic_name'], 0)
        if mistakes >= 2 or topic['accuracy'] < 55:
            hours = min(1.5, daily_hours * 0.2)
            recommendations.append({
                'topic_id': topic['topic_id'],
                'topic_name': topic['topic_name'],
                'subject': topic['subject'],
                'priority': priority,
                'recommended_hours': round(hours, 1),
                'reason': f"Moderate at {topic['accuracy']}% but {mistakes} mistakes detected. Needs reinforcement.",
                'practice_questions': 10,
                'accuracy': topic['accuracy'],
                'classification': 'medium',
                'action': 'Practice problems + review mistakes',
            })
            priority += 1

    # Add time management tip if applicable
    time_pressure = mistake_data.get('patterns', {}).get('time_pressure', 0)
    if time_pressure > 2:
        recommendations.append({
            'topic_id': None,
            'topic_name': 'Time Management',
            'subject': 'General',
            'priority': priority,
            'recommended_hours': 0.5,
            'reason': f"{time_pressure} time-pressure mistakes detected. Practice timed mock tests.",
            'practice_questions': 0,
            'accuracy': 0,
            'classification': 'skill',
            'action': 'Take timed mini-tests (15 min, 10 questions)',
        })
        priority += 1

    # Daily schedule suggestion
    total_recommended = sum(r['recommended_hours'] for r in recommendations)
    if total_recommended > daily_hours:
        scale = daily_hours / total_recommended
        for r in recommendations:
            r['recommended_hours'] = round(r['recommended_hours'] * scale, 1)

    return recommendations
