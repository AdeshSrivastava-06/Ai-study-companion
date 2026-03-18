import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15), transparent 70%), var(--bg-primary)',
        }}>
            <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: 420, padding: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                        <span className="gradient-text">Exam</span>Analytics
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        AI-Powered Performance Insights
                    </p>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                        Sign in to your account
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                                Username
                            </label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                                fontSize: 13, color: '#fca5a5',
                            }}>{error}</div>
                        )}

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                        No account?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
