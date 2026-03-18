import { useState, useEffect } from 'react';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

function StatCard({ icon, label, value, subtitle, colorClass, delay }) {
    return (
        <div className={`glass-card ${colorClass} animate-fadeInUp stagger-${delay}`}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
                fontSize: 28, width: 52, height: 52, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
            }}>{icon}</div>
            <div>
                <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
                {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [cluster, setCluster] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        Promise.all([
            API.get('/dashboard/'),
            API.get('/predictions/'),
            API.get('/clusters/'),
        ]).then(([d, p, c]) => {
            setData(d.data);
            setPrediction(p.data);
            setCluster(c.data);
        });
    }, []);

    if (!data) return (
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>Loading dashboard...</div>
        </div>
    );

    const scoresForChart = (data.recent_tests || []).map((t, i) => ({
        name: `Test ${i + 1}`,
        score: t.percentage || 0,
        accuracy: t.accuracy || 0,
    })).reverse();

    const subjectPie = {};
    [...(data.strong_subjects || []), ...(data.weak_subjects || [])].forEach(s => {
        subjectPie[s.name] = s.accuracy;
    });
    const pieData = Object.entries(subjectPie).slice(0, 6).map(([name, val]) => ({ name, value: val }));

    const trendArrow = prediction?.trend === 'improving' ? '↗️' : prediction?.trend === 'declining' ? '↘️' : '→';

    return (
        <div className="page-container">
            <div style={{ marginBottom: 8 }}>
                <h1 className="page-title">
                    Welcome back, <span className="gradient-text">{user?.first_name || user?.username}</span> 👋
                </h1>
                <p className="page-subtitle">Here's your performance overview</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                <StatCard icon="📝" label="Tests Taken" value={data.total_tests} colorClass="stat-card-purple" delay={1} />
                <StatCard icon="🎯" label="Accuracy" value={`${data.overall_accuracy}%`} colorClass="stat-card-green" delay={2} />
                <StatCard icon="📊" label="Avg Score" value={`${data.avg_score}%`} colorClass="stat-card-blue" delay={3} />
                <StatCard icon="⚡" label="Avg Speed" value={`${data.avg_speed}s`} subtitle="per question" colorClass="stat-card-cyan" delay={4} />
                <StatCard icon="🔮" label="Predicted Score" value={`${prediction?.predicted_score || '—'}%`} subtitle={`${trendArrow} ${prediction?.trend || ''}`} colorClass="stat-card-amber" delay={5} />
                <StatCard icon="👥" label="Your Profile" value={cluster?.cluster || '—'} subtitle={`Acc: ${cluster?.accuracy_score || 0}%`} colorClass="stat-card-red" delay={5} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
                {/* Score Trend */}
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📈 Score Trend</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={scoresForChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, fontSize: 13, color: '#f9fafb',
                                }}
                            />
                            <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                            <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Topic Distribution */}
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.4s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🎯 Topic Performance</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                                    dataKey="value" paddingAngle={3} label={({ name, value }) => `${name.slice(0, 8)} ${value}%`}
                                    style={{ fontSize: 10 }}>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{
                                    background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, fontSize: 13, color: '#f9fafb',
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            No data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Strong & Weak Topics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.5s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#6ee7b7' }}>💪 Strong Topics</h3>
                    {(data.strong_subjects || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Keep practicing to discover strengths!</p>
                    ) : (
                        data.strong_subjects.map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < data.strong_subjects.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ fontSize: 14 }}>{s.name}</span>
                                <span className="badge-strong">{s.accuracy}%</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="glass-card animate-fadeInUp" style={{ animationDelay: '0.6s', opacity: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#fca5a5' }}>⚠️ Needs Improvement</h3>
                    {(data.weak_subjects || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Great — no weak areas detected!</p>
                    ) : (
                        data.weak_subjects.map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < data.weak_subjects.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ fontSize: 14 }}>{s.name}</span>
                                <span className="badge-weak">{s.accuracy}%</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
