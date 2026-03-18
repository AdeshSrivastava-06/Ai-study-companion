import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function TakeTest() {
    const [step, setStep] = useState('setup'); // setup | test | result
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questionCount, setQuestionCount] = useState(10);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [questionTimes, setQuestionTimes] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const qTimerRef = useRef(Date.now());

    // Fetch available subjects
    useEffect(() => {
        API.get('/start-test/').then(res => {
            const topics = res.data.topics || [];
            const subs = [...new Set(topics.map(t => t.subject))];
            setSubjects(subs);
        });
    }, []);

    // Test timer
    useEffect(() => {
        if (step !== 'test' || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [step]);

    const startTest = async () => {
        setLoading(true);
        try {
            const params = { count: questionCount };
            if (selectedSubject) params.subject = selectedSubject;
            const res = await API.get('/start-test/', { params });
            const qs = res.data.questions || [];
            if (qs.length === 0) {
                alert('No questions found for this selection.');
                setLoading(false);
                return;
            }
            setQuestions(qs);
            setTimeLeft(res.data.time_limit_minutes * 60);
            setCurrentIndex(0);
            setAnswers({});
            setQuestionTimes({});
            qTimerRef.current = Date.now();
            setStep('test');
        } catch (e) {
            alert('Failed to load test. Try again.');
        }
        setLoading(false);
    };

    const recordQuestionTime = useCallback((idx) => {
        const elapsed = Math.round((Date.now() - qTimerRef.current) / 1000);
        setQuestionTimes(prev => ({
            ...prev,
            [idx]: (prev[idx] || 0) + elapsed,
        }));
        qTimerRef.current = Date.now();
    }, []);

    const goToQuestion = (newIdx) => {
        recordQuestionTime(currentIndex);
        setCurrentIndex(newIdx);
    };

    const selectOption = (opt) => {
        const qId = questions[currentIndex].id;
        setAnswers(prev => ({
            ...prev,
            [qId]: prev[qId] === opt ? '' : opt, // toggle
        }));
    };

    const handleSubmit = async () => {
        if (step !== 'test') return;
        recordQuestionTime(currentIndex);
        clearInterval(timerRef.current);
        setLoading(true);

        const totalTimeMin = Math.round((questions.length * 2 * 60 - timeLeft) / 60);
        const payload = {
            title: `${selectedSubject || 'Mixed'} Test — ${new Date().toLocaleDateString()}`,
            time_taken_minutes: totalTimeMin,
            answers: questions.map((q, i) => ({
                question_id: q.id,
                selected_option: answers[q.id] || '',
                time_taken_seconds: questionTimes[i] || 60,
            })),
        };

        try {
            const res = await API.post('/submit-test/', payload);
            setResult(res.data);
            setStep('result');
        } catch (e) {
            alert('Submission failed. Please try again.');
        }
        setLoading(false);
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // ── SETUP SCREEN ──────────────────────────────────────────
    if (step === 'setup') {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass-card animate-fadeInUp" style={{ maxWidth: 480, width: '100%' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                        🧪 <span className="gradient-text">Start a New Test</span>
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                        Choose subject and number of questions to begin
                    </p>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setSelectedSubject('')}
                                style={{
                                    padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                    background: !selectedSubject ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                                    color: !selectedSubject ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                }}>All Subjects</button>
                            {subjects.map(s => (
                                <button key={s} onClick={() => setSelectedSubject(s)} style={{
                                    padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                    background: selectedSubject === s ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                                    color: selectedSubject === s ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                }}>{s}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Number of Questions</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {[5, 10, 15, 20].map(n => (
                                <button key={n} onClick={() => setQuestionCount(n)} style={{
                                    padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                                    background: questionCount === n ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                                    color: questionCount === n ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: 14, fontWeight: 600, flex: 1,
                                }}>{n}</button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 16, marginBottom: 20, background: 'rgba(139,92,246,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <span>📝 Questions: {questionCount}</span>
                            <span>⏰ Time: {questionCount * 2} min</span>
                            <span>📊 Marks: {questionCount * 4}</span>
                        </div>
                    </div>

                    <button onClick={startTest} className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '⏳ Loading Questions...' : '🚀 Start Test'}
                    </button>
                </div>
            </div>
        );
    }

    // ── TEST SCREEN ───────────────────────────────────────────
    if (step === 'test') {
        const q = questions[currentIndex];
        const answered = Object.keys(answers).filter(k => answers[k]).length;
        const isUrgent = timeLeft < 120;

        return (
            <div className="page-container" style={{ paddingBottom: 100 }}>
                {/* Top Bar */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 20, position: 'sticky', top: 0, zIndex: 10,
                    background: 'var(--bg-primary)', padding: '12px 0',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                        Q {currentIndex + 1} / {questions.length}
                    </div>
                    <div style={{
                        fontSize: 16, fontWeight: 800, padding: '6px 16px', borderRadius: 8,
                        background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)',
                        color: isUrgent ? '#ef4444' : '#8b5cf6',
                    }}>
                        ⏱ {formatTime(timeLeft)}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {answered}/{questions.length} answered
                    </div>
                </div>

                {/* Question Navigation */}
                <div className="glass-card" style={{ padding: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {questions.map((ques, i) => {
                            const isAnswered = answers[ques.id];
                            const isCurrent = i === currentIndex;
                            return (
                                <button key={i} onClick={() => goToQuestion(i)} style={{
                                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontWeight: 700, fontSize: 12,
                                    background: isCurrent ? 'var(--accent-purple)' :
                                        isAnswered ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)',
                                    color: isCurrent ? 'white' :
                                        isAnswered ? '#6ee7b7' : 'var(--text-muted)',
                                    outline: isCurrent ? '2px solid var(--accent-purple)' : 'none',
                                }}>
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Question Card */}
                <div className="glass-card animate-fadeIn" key={currentIndex} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                            background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' :
                                q.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                            color: q.difficulty === 'easy' ? '#6ee7b7' :
                                q.difficulty === 'medium' ? '#fcd34d' : '#fca5a5',
                        }}>{q.difficulty.toUpperCase()}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {q.topic_name} • +{q.marks}/-{q.negative_marks} marks
                        </span>
                    </div>

                    <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.7, marginBottom: 24 }}>
                        {q.text}
                    </p>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { key: 'A', text: q.option_a },
                            { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c },
                            { key: 'D', text: q.option_d },
                        ].map(opt => {
                            const isSelected = answers[q.id] === opt.key;
                            return (
                                <button key={opt.key} onClick={() => selectOption(opt.key)} style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                                    borderRadius: 10, border: `2px solid ${isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)'}`,
                                    background: isSelected ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                                    cursor: 'pointer', textAlign: 'left', width: '100%',
                                    transition: 'all 0.2s ease',
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isSelected ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)',
                                        color: isSelected ? 'white' : 'var(--text-secondary)',
                                        fontWeight: 700, fontSize: 14,
                                    }}>
                                        {opt.key}
                                    </div>
                                    <span style={{
                                        fontSize: 14, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: isSelected ? 600 : 400,
                                    }}>
                                        {opt.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                    <button onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        style={{
                            padding: '10px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600,
                            opacity: currentIndex === 0 ? 0.4 : 1,
                        }}>← Previous</button>

                    {currentIndex < questions.length - 1 ? (
                        <button onClick={() => goToQuestion(currentIndex + 1)} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: 'var(--accent-purple)', color: 'white',
                            cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        }}>Next →</button>
                    ) : (
                        <button onClick={() => {
                            if (window.confirm(`Submit test? ${answers ? Object.keys(answers).filter(k => answers[k]).length : 0}/${questions.length} answered.`))
                                handleSubmit();
                        }} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
                            cursor: 'pointer', fontSize: 14, fontWeight: 700,
                        }}>✅ Submit Test</button>
                    )}
                </div>

                {/* Submit floating button */}
                <div style={{
                    position: 'fixed', bottom: 20, right: 30, zIndex: 100,
                }}>
                    <button onClick={() => {
                        if (window.confirm(`Submit test? ${Object.keys(answers).filter(k => answers[k]).length}/${questions.length} answered.`))
                            handleSubmit();
                    }} className="btn-primary" style={{
                        padding: '12px 24px', borderRadius: 12,
                        boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                    }} disabled={loading}>
                        {loading ? '⏳' : '📩 Submit'}
                    </button>
                </div>
            </div>
        );
    }

    // ── RESULT SCREEN ─────────────────────────────────────────
    if (step === 'result' && result) {
        const pct = result.percentage || 0;
        const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : pct >= 40 ? '📈' : '💪';

        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass-card animate-fadeInUp" style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 8 }}>{emoji}</div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                        <span className="gradient-text">Test Complete!</span>
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Here's how you did</p>

                    <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 8 }} className="gradient-text">
                        {pct}%
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                        {result.score}/{result.total_marks} marks
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{result.correct}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Correct</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{result.incorrect}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wrong</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#6b7280' }}>{result.skipped}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skipped</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => navigate(`/test-review/${result.test_id}`)} className="btn-primary" style={{ flex: 1 }}>
                            📋 Review Answers
                        </button>
                        <button onClick={() => setStep('setup')} style={{
                            flex: 1, padding: '10px 20px', borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        }}>
                            🔄 Take Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
