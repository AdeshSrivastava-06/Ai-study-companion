import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/client';

export default function TestReview() {
    const { testId } = useParams();
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        API.get(`/tests/${testId}/review/`).then(res => setData(res.data));
    }, [testId]);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Loading review...</div>
        </div>
    );

    const attempts = data.attempts || [];
    const correct = attempts.filter(a => a.is_correct).length;
    const incorrect = attempts.filter(a => a.status === 'incorrect').length;
    const skipped = attempts.filter(a => a.status === 'skipped').length;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: 4 }}>📋 <span className="gradient-text">Test Review</span></h1>
                    <p className="page-subtitle">{data.title}</p>
                </div>
                <button onClick={() => navigate('/tests')} style={{
                    padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}>← Back to Tests</button>
            </div>

            {/* Score Summary */}
            <div className="glass-card animate-fadeInUp stagger-1" style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, textAlign: 'center', marginBottom: 24,
            }}>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800 }} className="gradient-text">{data.percentage}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score</div>
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{correct}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Correct</div>
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{incorrect}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wrong</div>
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#6b7280' }}>{skipped}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skipped</div>
                </div>
                <div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{data.total_questions}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</div>
                </div>
            </div>

            {/* Question-by-question review */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {attempts.map((attempt, i) => {
                    const q = attempt.question_detail;
                    if (!q) return null;
                    const isCorrect = attempt.is_correct;
                    const isSkipped = attempt.status === 'skipped';
                    const borderColor = isCorrect ? '#10b981' : isSkipped ? '#6b7280' : '#ef4444';

                    return (
                        <div key={i} className="glass-card animate-fadeInUp" style={{
                            animationDelay: `${i * 0.05}s`, opacity: 0,
                            borderLeft: `4px solid ${borderColor}`,
                        }}>
                            {/* Question Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>Question {i + 1}</span>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                                        background: q.difficulty === 'easy' ? 'rgba(16,185,129,0.15)' :
                                            q.difficulty === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                        color: q.difficulty === 'easy' ? '#6ee7b7' :
                                            q.difficulty === 'medium' ? '#fcd34d' : '#fca5a5',
                                    }}>{q.difficulty}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{attempt.topic_name}</span>
                                    <span style={{
                                        fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                                        background: isCorrect ? 'rgba(16,185,129,0.15)' :
                                            isSkipped ? 'rgba(107,114,128,0.15)' : 'rgba(239,68,68,0.15)',
                                        color: isCorrect ? '#6ee7b7' : isSkipped ? '#9ca3af' : '#fca5a5',
                                    }}>
                                        {isCorrect ? '✓ Correct' : isSkipped ? '○ Skipped' : '✗ Wrong'}
                                        {' '}({attempt.marks_obtained > 0 ? '+' : ''}{attempt.marks_obtained})
                                    </span>
                                </div>
                            </div>

                            {/* Question Text */}
                            <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.7, marginBottom: 16 }}>{q.text}</p>

                            {/* Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                                {[
                                    { key: 'A', text: q.option_a },
                                    { key: 'B', text: q.option_b },
                                    { key: 'C', text: q.option_c },
                                    { key: 'D', text: q.option_d },
                                ].map(opt => {
                                    const isCorrectOpt = opt.key === q.correct_answer;
                                    const isStudentPick = opt.key === attempt.student_answer;
                                    const isWrongPick = isStudentPick && !isCorrectOpt;

                                    let bg = 'rgba(255,255,255,0.03)';
                                    let borderClr = 'rgba(255,255,255,0.06)';
                                    let textClr = 'var(--text-secondary)';

                                    if (isCorrectOpt) {
                                        bg = 'rgba(16,185,129,0.12)';
                                        borderClr = 'rgba(16,185,129,0.4)';
                                        textClr = '#6ee7b7';
                                    }
                                    if (isWrongPick) {
                                        bg = 'rgba(239,68,68,0.12)';
                                        borderClr = 'rgba(239,68,68,0.4)';
                                        textClr = '#fca5a5';
                                    }

                                    return (
                                        <div key={opt.key} style={{
                                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                                            borderRadius: 8, border: `1.5px solid ${borderClr}`, background: bg,
                                        }}>
                                            <div style={{
                                                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isCorrectOpt ? '#10b981' : isWrongPick ? '#ef4444' : 'rgba(255,255,255,0.08)',
                                                color: (isCorrectOpt || isWrongPick) ? 'white' : 'var(--text-muted)',
                                                fontWeight: 700, fontSize: 12,
                                            }}>
                                                {isCorrectOpt ? '✓' : isWrongPick ? '✗' : opt.key}
                                            </div>
                                            <span style={{ fontSize: 13, color: textClr, fontWeight: (isCorrectOpt || isWrongPick) ? 600 : 400 }}>
                                                {opt.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                                <div style={{
                                    padding: '10px 14px', borderRadius: 8,
                                    background: 'rgba(139,92,246,0.08)', borderLeft: '3px solid var(--accent-purple)',
                                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                                }}>
                                    💡 <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
