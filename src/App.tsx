import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewLesson } from './pages/NewLesson';
import { EditLesson } from './pages/EditLesson';
import { LessonDetail } from './pages/LessonDetail';
import { PublicLesson } from './pages/PublicLesson';
import { Explore } from './pages/Explore';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><LandingPage /></Layout>} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route
              path="/lessons/new"
              element={
                <Layout>
                  <ProtectedRoute>
                    <NewLesson />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <LessonDetail />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/lessons/:id/edit"
              element={
                <Layout>
                  <ProtectedRoute>
                    <EditLesson />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route path="/public/:slug" element={<Layout><PublicLesson /></Layout>} />
            <Route path="/explore" element={<Layout><Explore /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
