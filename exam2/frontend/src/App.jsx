import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TopicIntelligence from './pages/TopicIntelligence';
import MistakeReport from './pages/MistakeReport';
import StudyPlan from './pages/StudyPlan';
import Progress from './pages/Progress';
import TestAnalytics from './pages/TestAnalytics';
import TakeTest from './pages/TakeTest';
import TestReview from './pages/TestReview';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="gradient-text" style={{ fontSize: 24, fontWeight: 700 }}>Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topics" element={<TopicIntelligence />} />
          <Route path="/mistakes" element={<MistakeReport />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/tests" element={<TestAnalytics />} />
          <Route path="/take-test" element={<TakeTest />} />
          <Route path="/test-review/:testId" element={<TestReview />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
