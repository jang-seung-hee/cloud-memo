import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context Providers
import { MemoProvider } from './contexts/MemoContext';
import { ImageProvider } from './contexts/ImageContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { AuthProvider } from './contexts/AuthContext';

// 레이아웃 컴포넌트
import Header from './components/layout/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';

// 메인 페이지들
import HomePage from './pages/HomePage';
import MemoWritePage from './pages/MemoWritePage';
import MemoDetailPage from './pages/MemoDetailPage';
import TemplateManagePage from './pages/TemplateManagePage';
import LoginPage from './pages/LoginPage';

// 테스트 페이지들
import ComponentTest from './pages/ComponentTest';
import ServiceTest from './pages/ServiceTest';
import ImageUtilsTest from './pages/ImageUtilsTest';
import MemoCRUDTest from './pages/MemoCRUDTest';
import ImageAttachmentTest from './pages/ImageAttachmentTest';
import TemplateManagementTest from './pages/TemplateManagementTest';
import PerformanceTest from './pages/PerformanceTest';
import ClipboardTest from './pages/ClipboardTest';
import FirebaseTest from './pages/FirebaseTest';

// 레이아웃 컴포넌트
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MemoProvider>
          <ImageProvider>
            <TemplateProvider>
              <div className="App">
                              <Routes>
                {/* 인증 페이지 */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* 보호된 메인 페이지들 */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><HomePage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/write" element={
                  <ProtectedRoute>
                    <Layout><MemoWritePage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/memo/:id" element={
                  <ProtectedRoute>
                    <MemoDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/templates" element={
                  <ProtectedRoute>
                    <Layout><TemplateManagePage /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* 테스트 페이지들 */}
                <Route path="/test" element={<ComponentTest />} />
                <Route path="/service-test" element={<ServiceTest />} />
                <Route path="/image-utils-test" element={<ImageUtilsTest />} />
                <Route path="/memo-crud-test" element={<MemoCRUDTest />} />
                <Route path="/image-attachment-test" element={<ImageAttachmentTest />} />
                <Route path="/template-management-test" element={<TemplateManagementTest />} />
                <Route path="/performance-test" element={<PerformanceTest />} />
                <Route path="/clipboard-test" element={<ClipboardTest />} />
                <Route path="/firebase-test" element={<FirebaseTest />} />
              </Routes>
              </div>
            </TemplateProvider>
          </ImageProvider>
        </MemoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
