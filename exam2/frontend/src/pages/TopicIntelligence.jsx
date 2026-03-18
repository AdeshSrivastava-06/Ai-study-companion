import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const COLORS = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981' };

export default function TopicIntelligence() {
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get('/topics/').then(res => setData(res.data));
    }, []);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Analyzing topics...</div>
        </div>
    );

    const { topics, summary } = data;

    // Group by subject
    const subjects = {};
    topics.forEach(t => {
        if (!subjects[t.subject]) subjects[t.subject] = [];
        subjects[t.subject].push(t);
    });

    // Radar data (top 10 topics)
    const radarData = topics.slice(0, 12).map(t => ({
        topic: t.topic_name.length > 10 ? t.topic_name.slice(0, 10) + '…' : t.topic_name,
        accuracy: t.accuracy,
        fullMark: 100,
    }));

    return (
        <div className="page-container">
            <h1 className="page-title">🧠 <span className="gradient-text">Topic Intelligence</span></h1>
            <p className="page-subtitle">AI-powered analysis of your strengths and weaknesses across all topics</p>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Weak Topics', count: summary.weak, color: '#ef4444', icon: '🔴' },
                    { label: 'Moderate Topics', count: summary.medium, color: '#f59e0b', icon: '🟡' },
                    { label: 'Strong Topics', count: summary.strong, color: '#10b981', icon: '🟢' },
                ].map((item, i) => (
                    <div key={i} className="glass-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s`, opacity: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 36 }}>{item.icon}</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: item.color, marginTop: 8 }}>{item.count}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                {/* Radar */}
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📡 Skill Radar</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="topic" stroke="#9ca3af" fontSize={10} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
                            <Radar dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                            <Tooltip contentStyle={{
                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                            }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Accuracy by Topic</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topics.map(t => ({ name: t.topic_name.slice(0, 8), accuracy: t.accuracy, cls: t.classification }))} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                            <YAxis dataKey="name" type="category" width={80} stroke="#6b7280" fontSize={11} />
                            <Tooltip contentStyle={{
                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                            }} />
                            <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                                {topics.map((t, i) => (
                                    <Cell key={i} fill={COLORS[t.classification] || '#6b7280'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Topics by Subject */}
            {Object.entries(subjects).map(([subject, topicList]) => (
                <div key={subject} className="glass-card animate-fadeInUp" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                        {subject === 'Physics' ? '⚡' : subject === 'Chemistry' ? '🧪' : '📐'} {subject}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                        {topicList.map((t, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16,
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.topic_name}</span>
                                    <span className={`badge-${t.classification}`}>{t.classification}</span>
                                </div>
                                <div className="topic-bar" style={{ marginBottom: 8 }}>
                                    <div className="topic-bar-fill" style={{
                                        width: `${t.accuracy}%`,
                                        background: COLORS[t.classification],
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>Accuracy: {t.accuracy}%</span>
                                    <span>Attempts: {t.attempt_count}</span>
                                    <span>Avg: {t.avg_time_seconds}s</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
