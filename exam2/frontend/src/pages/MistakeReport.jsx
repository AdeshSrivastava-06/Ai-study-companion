import { useState, useEffect } from 'react';
import API from '../api/client';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const TYPE_CONFIG = {
    conceptual: { icon: '📘', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    silly: { icon: '🤦', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    time_pressure: { icon: '⏱️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    guessing: { icon: '🎲', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export default function MistakeReport() {
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get('/mistakes/').then(res => setData(res.data));
    }, []);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Analyzing mistakes...</div>
        </div>
    );

    if (data.total_mistakes === 0) return (
        <div className="page-container">
            <h1 className="page-title">🔁 <span className="gradient-text">Mistake Report</span></h1>
            <div className="glass-card" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Perfect Score!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>No mistakes detected. Keep up the great work!</p>
            </div>
        </div>
    );

    const pieData = (data.summary || []).filter(s => s.count > 0).map(s => ({
        name: s.label, value: s.count, color: s.color,
    }));

    return (
        <div className="page-container">
            <h1 className="page-title">🔁 <span className="gradient-text">Mistake Report</span></h1>
            <p className="page-subtitle">AI-detected patterns in your mistakes to help you improve faster</p>

            {/* Total mistakes */}
            <div className="glass-card stat-card-red animate-fadeInUp stagger-1" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 32 }}>📋</div>
                <div>
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{data.total_mistakes}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Total Mistakes Analyzed</div>
                </div>
            </div>

            {/* Pattern Cards + Pie Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {(data.summary || []).map((s, i) => {
                            const cfg = TYPE_CONFIG[s.type] || {};
                            return (
                                <div key={i} className="glass-card animate-fadeInUp" style={{
                                    animationDelay: `${0.1 + i * 0.1}s`, opacity: 0,
                                    borderLeft: `3px solid ${s.color}`,
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>{cfg.icon}</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.count}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.description}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎯 Mistake Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                                dataKey="value" paddingAngle={4}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                style={{ fontSize: 11 }}>
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{
                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                            }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Mistake Topics */}
            <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.5s', opacity: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🔥 Top Mistake Topics</h3>
                {data.top_mistake_topics?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={Math.max(200, data.top_mistake_topics.length * 50)}>
                        <BarChart data={data.top_mistake_topics} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" stroke="#6b7280" fontSize={12} />
                            <YAxis dataKey="topic" type="category" width={120} stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{
                                background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, fontSize: 13, color: '#f9fafb',
                            }} />
                            <Bar dataKey="mistakes" fill="#ef4444" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No mistake data available yet.</p>
                )}
            </div>
        </div>
    );
}
