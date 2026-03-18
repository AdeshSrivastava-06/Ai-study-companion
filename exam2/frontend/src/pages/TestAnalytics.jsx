import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie,
} from 'recharts';

export default function TestAnalytics() {
    const [tests, setTests] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        API.get('/tests/').then(res => setTests(res.data));
    }, []);

    const loadDetail = async (id) => {
        setSelected(id);
        const res = await API.get(`/tests/${id}/`);
        setDetail(res.data);
    };

    // Group attempts by topic
    const topicBreakdown = detail ? (() => {
        const map = {};
        (detail.attempts || []).forEach(a => {
            if (!map[a.topic_name]) map[a.topic_name] = { correct: 0, incorrect: 0, skipped: 0, total: 0, totalTime: 0 };
            map[a.topic_name][a.status] = (map[a.topic_name][a.status] || 0) + 1;
            map[a.topic_name].total += 1;
            map[a.topic_name].totalTime += a.time_taken_seconds;
        });
        return Object.entries(map).map(([name, d]) => ({
            name,
            correct: d.correct,
            incorrect: d.incorrect,
            skipped: d.skipped || 0,
            accuracy: d.total > 0 ? Math.round(d.correct / d.total * 100) : 0,
            avgTime: d.total > 0 ? Math.round(d.totalTime / d.total) : 0,
        }));
    })() : [];

    const statusPie = detail ? [
        { name: 'Correct', value: (detail.attempts || []).filter(a => a.status === 'correct').length, color: '#10b981' },
        { name: 'Incorrect', value: (detail.attempts || []).filter(a => a.status === 'incorrect').length, color: '#ef4444' },
        { name: 'Skipped', value: (detail.attempts || []).filter(a => a.status === 'skipped').length, color: '#6b7280' },
    ] : [];

    return (
        <div className="page-container">
            <h1 className="page-title">📝 <span className="gradient-text">Test History</span></h1>
            <p className="page-subtitle">Detailed question-level analytics for every test you've taken</p>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
                {/* Test List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tests.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
                            <p style={{ color: 'var(--text-muted)' }}>No tests found</p>
                        </div>
                    ) : tests.map((test, i) => (
                        <div key={test.id}
                            onClick={() => loadDetail(test.id)}
                            className="glass-card animate-fadeInUp"
                            style={{
                                animationDelay: `${i * 0.05}s`, opacity: 0,
                                cursor: 'pointer', padding: 16,
                                borderLeft: selected === test.id ? '3px solid var(--accent-purple)' : '3px solid transparent',
                                background: selected === test.id ? 'rgba(139,92,246,0.1)' : undefined,
                            }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{test.title}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>{new Date(test.date).toLocaleDateString()}</span>
                                <span style={{ color: test.percentage >= 60 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                    {test.percentage}%
                                </span>
                            </div>
                            <div className="topic-bar" style={{ marginTop: 8 }}>
                                <div className="topic-bar-fill" style={{
                                    width: `${test.percentage}%`,
                                    background: test.percentage >= 70 ? '#10b981' : test.percentage >= 40 ? '#f59e0b' : '#ef4444',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                <div>
                    {!detail ? (
                        <div className="glass-card" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: 400, flexDirection: 'column', gap: 12,
                        }}>
                            <div style={{ fontSize: 48 }}>📋</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Select a test to view detailed analytics</p>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            {/* Test Overview */}
                            <div className="glass-card" style={{ marginBottom: 20 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{detail.title}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                    {[
                                        { label: 'Score', value: `${detail.percentage}%`, color: '#8b5cf6' },
                                        { label: 'Accuracy', value: `${detail.accuracy}%`, color: '#06b6d4' },
                                        { label: 'Questions', value: detail.total_questions, color: '#3b82f6' },
                                        { label: 'Time', value: `${detail.time_taken_minutes}m`, color: '#f59e0b' },
                                    ].map((s, i) => (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Charts */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                {/* Status Pie */}
                                <div className="glass-card">
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Answer Distribution</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={statusPie.filter(s => s.value > 0)} cx="50%" cy="50%"
                                                outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={4}
                                                label={({ name, value }) => `${name}: ${value}`} style={{ fontSize: 11 }}>
                                                {statusPie.map((s, i) => <Cell key={i} fill={s.color} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{
                                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                                            }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Topic accuracy bar */}
                                <div className="glass-card">
                                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Per-Topic Accuracy</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={topicBreakdown}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={60} />
                                            <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                                            <Tooltip contentStyle={{
                                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                                            }} />
                                            <Bar dataKey="accuracy" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                                                {topicBreakdown.map((t, i) => (
                                                    <Cell key={i} fill={t.accuracy >= 70 ? '#10b981' : t.accuracy >= 40 ? '#f59e0b' : '#ef4444'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Question-by-question table */}
                            <div className="glass-card">
                                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Question-Level Breakdown</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '10px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>#</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Topic</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Time</th>
                                                <th style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(detail.attempts || []).map((a, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{i + 1}</td>
                                                    <td style={{ padding: '8px' }}>{a.topic_name}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                                                            background: a.status === 'correct' ? 'rgba(16,185,129,0.15)' :
                                                                a.status === 'incorrect' ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)',
                                                            color: a.status === 'correct' ? '#6ee7b7' :
                                                                a.status === 'incorrect' ? '#fca5a5' : '#9ca3af',
                                                        }}>
                                                            {a.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{a.difficulty}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{a.time_taken_seconds}s</td>
                                                    <td style={{
                                                        padding: '8px', textAlign: 'center', fontWeight: 600,
                                                        color: a.marks_obtained > 0 ? '#10b981' : a.marks_obtained < 0 ? '#ef4444' : 'var(--text-muted)',
                                                    }}>
                                                        {a.marks_obtained > 0 ? '+' : ''}{a.marks_obtained}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
