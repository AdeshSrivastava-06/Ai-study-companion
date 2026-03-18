import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/take-test', label: 'Take Test', icon: '🧪' },
    { path: '/topics', label: 'Topic Intelligence', icon: '🧠' },
    { path: '/mistakes', label: 'Mistake Report', icon: '🔁' },
    { path: '/study-plan', label: 'Study Plan', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/tests', label: 'Test History', icon: '📝' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside style={{
            position: 'fixed', left: 0, top: 0, bottom: 0,
            width: 260, background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-glass)',
            display: 'flex', flexDirection: 'column',
            zIndex: 50,
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px', borderBottom: '1px solid var(--border-glass)',
            }}>
                <div style={{
                    fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
                }}>
                    <span className="gradient-text">Exam</span>
                    <span style={{ color: 'var(--text-primary)' }}>Analytics</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    AI-Powered Performance Insights
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 16px', marginBottom: 4,
                            borderRadius: 12, textDecoration: 'none',
                            fontSize: 14, fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--accent-purple)' : '3px solid transparent',
                            transition: 'all 0.2s ease',
                        })}
                    >
                        <span style={{ fontSize: 18 }}>{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User profile */}
            <div style={{
                padding: '16px 16px', borderTop: '1px solid var(--border-glass)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 12,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                    }}>
                        {user?.first_name?.[0] || user?.username?.[0] || '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {user?.first_name || user?.username}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {user?.target_exam || 'Student'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 8, color: '#fca5a5',
                        fontSize: 13, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
