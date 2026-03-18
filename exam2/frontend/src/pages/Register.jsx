import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        username: '', email: '', password: '', first_name: '', last_name: '',
        target_exam: 'JEE', target_score: 80, daily_study_hours: 4,
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);
        try {
            await register(form);
            navigate('/');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                setFieldErrors(data.errors);
                setError(data.message || 'Please fix the errors below.');
            } else if (data?.message) {
                setError(data.message);
            } else {
                setError('Registration failed. Please check your details and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const update = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        if (fieldErrors[key]) setFieldErrors(p => ({ ...p, [key]: null }));
    };

    const fieldStyle = (field) => ({
        borderColor: fieldErrors[field] ? 'rgba(239,68,68,0.6)' : undefined,
    });

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15), transparent 70%), var(--bg-primary)',
            padding: 20,
        }}>
            <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: 480 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800 }}>
                        <span className="gradient-text">Exam</span>Analytics
                    </h1>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create Account</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Start your data-driven prep</p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>First Name</label>
                                <input className="input-field" style={fieldStyle('first_name')} placeholder="First" value={form.first_name} onChange={e => update('first_name', e.target.value)} required />
                                {fieldErrors.first_name && <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{fieldErrors.first_name}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Last Name</label>
                                <input className="input-field" style={fieldStyle('last_name')} placeholder="Last" value={form.last_name} onChange={e => update('last_name', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Username</label>
                            <input className="input-field" style={fieldStyle('username')} placeholder="Min 3 characters" value={form.username} onChange={e => update('username', e.target.value)} required />
                            {fieldErrors.username && <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{fieldErrors.username}</div>}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Email</label>
                            <input className="input-field" style={fieldStyle('email')} type="email" placeholder="name@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                            {fieldErrors.email && <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{fieldErrors.email}</div>}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Password</label>
                            <input className="input-field" style={fieldStyle('password')} type="password" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
                            {fieldErrors.password && <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 4 }}>{fieldErrors.password}</div>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Target Exam</label>
                                <select className="input-field" value={form.target_exam} onChange={e => update('target_exam', e.target.value)}>
                                    <option>JEE</option><option>GATE</option><option>UPSC</option><option>CAT</option><option>Banking</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Target %</label>
                                <input className="input-field" type="number" value={form.target_score} onChange={e => update('target_score', +e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Hours/Day</label>
                                <input className="input-field" type="number" step="0.5" value={form.daily_study_hours} onChange={e => update('daily_study_hours', +e.target.value)} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#fca5a5' }}>{error}</div>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
