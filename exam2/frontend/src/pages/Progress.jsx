import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    BarChart, Bar, Cell,
} from 'recharts';

export default function Progress() {
    const [data, setData] = useState(null);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        Promise.all([
            API.get('/progress/'),
            API.get('/predictions/'),
        ]).then(([p, pred]) => {
            setData(p.data);
            setPrediction(pred.data);
        });
    }, []);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Loading progress...</div>
        </div>
    );

    const { score_trend, accuracy_trend, topic_progress } = data;
    const trendIcon = prediction?.trend === 'improving' ? '📈' : prediction?.trend === 'declining' ? '📉' : '📊';
    const trendColor = prediction?.trend === 'improving' ? '#10b981' : prediction?.trend === 'declining' ? '#ef4444' : '#f59e0b';

    // Combine score + accuracy for chart
    const combinedTrend = score_trend.map((s, i) => ({
        ...s,
        accuracy: accuracy_trend[i]?.accuracy || 0,
    }));

    return (
        <div className="page-container">
            <h1 className="page-title">📈 <span className="gradient-text">Progress Over Time</span></h1>
            <p className="page-subtitle">Track your improvement and predicted exam readiness</p>

            {/* Prediction Card */}
            <div className="glass-card animate-fadeInUp stagger-1" style={{
                marginBottom: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, textAlign: 'center',
            }}>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Predicted Next Score</div>
                    <div style={{ fontSize: 40, fontWeight: 800 }} className="gradient-text">
                        {prediction?.predicted_score || '—'}%
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Trend</div>
                    <div style={{ fontSize: 40 }}>{trendIcon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: trendColor, textTransform: 'capitalize' }}>
                        {prediction?.trend || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Confidence</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: trendColor }}>
                        {((prediction?.confidence || 0) * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* Score & Accuracy Trend */}
            <div className="glass-card animate-fadeInUp stagger-2" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📊 Score & Accuracy Trend</h3>
                {combinedTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={combinedTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="test_number" stroke="#6b7280" fontSize={12} label={{ value: 'Test #', position: 'bottom', fill: '#6b7280' }} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                            <Tooltip contentStyle={{
                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                            }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                            <Line type="monotone" dataKey="score" name="Score %" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                            <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Take more tests to see trends!
                    </div>
                )}
            </div>

            {/* Topic Progress */}
            <div className="glass-card animate-fadeInUp stagger-3">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📚 Topic Improvement</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Comparing your earlier vs. recent performance per topic
                </p>
                {topic_progress.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={Math.max(300, topic_progress.length * 35)}>
                            <BarChart data={topic_progress} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[-30, 30]}
                                    label={{ value: 'Improvement %', position: 'bottom', fill: '#6b7280' }} />
                                <YAxis dataKey="topic" type="category" width={120} stroke="#6b7280" fontSize={11} />
                                <Tooltip contentStyle={{
                                    background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, fontSize: 13, color: '#f9fafb',
                                }}
                                    formatter={(val, name) => [`${val > 0 ? '+' : ''}${val}%`, name]}
                                />
                                <Bar dataKey="improvement" name="Improvement" radius={[0, 6, 6, 0]}>
                                    {topic_progress.map((entry, i) => (
                                        <Cell key={i} fill={entry.improvement >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Detailed table */}
                        <div style={{ marginTop: 24, overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Topic</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Earlier</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Recent</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topic_progress.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 500 }}>{t.topic}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{t.earlier_accuracy}%</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{t.recent_accuracy}%</td>
                                            <td style={{
                                                padding: '10px 12px', textAlign: 'center', fontWeight: 700,
                                                color: t.improvement >= 0 ? '#10b981' : '#ef4444',
                                            }}>
                                                {t.improvement >= 0 ? '+' : ''}{t.improvement}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Need more test data to show topic improvement
                    </div>
                )}
            </div>
        </div>
    );
}
