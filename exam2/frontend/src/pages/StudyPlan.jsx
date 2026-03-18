import { useState, useEffect } from 'react';
import API from '../api/client';

const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

export default function StudyPlan() {
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get('/recommendations/').then(res => setData(res.data));
    }, []);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Generating study plan...</div>
        </div>
    );

    const { recommendations, daily_hours, total_topics_to_focus } = data;
    const totalHours = recommendations.reduce((sum, r) => sum + r.recommended_hours, 0);

    return (
        <div className="page-container">
            <h1 className="page-title">📚 <span className="gradient-text">AI Study Plan</span></h1>
            <p className="page-subtitle">Personalized recommendations based on your performance patterns</p>

            {/* Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                <div className="glass-card stat-card-purple animate-fadeInUp stagger-1" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32 }}>🎯</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{total_topics_to_focus}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Topics to Focus</div>
                </div>
                <div className="glass-card stat-card-blue animate-fadeInUp stagger-2" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32 }}>⏰</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{totalHours.toFixed(1)}h</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Study Time</div>
                </div>
                <div className="glass-card stat-card-green animate-fadeInUp stagger-3" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32 }}>📅</div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{daily_hours}h</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Daily Budget</div>
                </div>
            </div>

            {/* Recommendation Cards */}
            {recommendations.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: 24, fontWeight: 700 }}>Looking Great!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>No urgent topics to focus on. Keep practicing consistently!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {recommendations.map((rec, i) => (
                        <div key={i} className="glass-card animate-fadeInUp" style={{
                            animationDelay: `${0.1 + i * 0.08}s`, opacity: 0,
                            borderLeft: `4px solid ${PRIORITY_COLORS[i % PRIORITY_COLORS.length]}`,
                            display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 20, alignItems: 'center',
                        }}>
                            {/* Priority Badge */}
                            <div style={{
                                width: 52, height: 52, borderRadius: 12,
                                background: `${PRIORITY_COLORS[i % PRIORITY_COLORS.length]}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 22, fontWeight: 800,
                                color: PRIORITY_COLORS[i % PRIORITY_COLORS.length],
                            }}>
                                #{rec.priority}
                            </div>

                            {/* Content */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16, fontWeight: 700 }}>{rec.topic_name}</span>
                                    <span className={`badge-${rec.classification}`}>{rec.classification}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                                        {rec.subject}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                                    {rec.reason}
                                </p>
                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>📖 {rec.action}</span>
                                    {rec.practice_questions > 0 && <span>📝 {rec.practice_questions} questions</span>}
                                </div>
                            </div>

                            {/* Time */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: PRIORITY_COLORS[i % PRIORITY_COLORS.length] }}>
                                    {rec.recommended_hours}h
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>recommended</div>
                                {rec.accuracy > 0 && (
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                        Current: {rec.accuracy}%
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Daily Schedule */}
            {recommendations.length > 0 && (
                <div className="glass-card animate-fadeInUp" style={{ marginTop: 24, animationDelay: '0.6s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📋 Today's Schedule</h3>
                    <div style={{ display: 'flex', gap: 0, overflow: 'hidden', borderRadius: 8, height: 40 }}>
                        {recommendations.filter(r => r.recommended_hours > 0).map((rec, i) => {
                            const pct = (rec.recommended_hours / totalHours) * 100;
                            return (
                                <div key={i} style={{
                                    width: `${pct}%`, background: PRIORITY_COLORS[i % PRIORITY_COLORS.length],
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 600, color: 'white',
                                    minWidth: 40, transition: 'all 0.3s ease',
                                }}
                                    title={`${rec.topic_name}: ${rec.recommended_hours}h`}
                                >
                                    {pct > 15 ? `${rec.topic_name.slice(0, 6)}` : ''}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                        {recommendations.filter(r => r.recommended_hours > 0).map((rec, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: PRIORITY_COLORS[i % PRIORITY_COLORS.length] }} />
                                {rec.topic_name} ({rec.recommended_hours}h)
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
