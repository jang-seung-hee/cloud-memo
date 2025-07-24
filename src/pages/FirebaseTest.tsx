import React, { useState } from 'react';
import { Button, Card, Modal } from '../components/ui';
import { isFirebaseAvailable, getCurrentUserId } from '../services/firebaseService';
import { useAuthContext } from '../contexts/AuthContext';
import { auth } from '../config/firebase';

const FirebaseTest: React.FC = () => {
  const { state: authState, login, logout } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const showModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const checkFirebaseStatus = () => {
    const firebaseAvailable = isFirebaseAvailable();
    const currentUserId = getCurrentUserId();
    const isAuthenticated = !!authState.user;
    const currentUser = auth.currentUser;

    const statusText = `
Firebase 연결 상태:
- Firebase 사용 가능: ${firebaseAvailable ? '✅' : '❌'}
- 인증 상태: ${isAuthenticated ? '✅ 로그인됨' : '❌ 로그인 필요'}
- 현재 사용자 ID: ${currentUserId || '없음'}
- Auth.currentUser: ${currentUser ? '✅ 존재함' : '❌ 없음'}
- 사용자 정보: ${authState.user ? `${authState.user.displayName} (${authState.user.email})` : '없음'}

환경변수 확인:
- API Key: ${process.env.REACT_APP_FIREBASE_API_KEY ? '✅ 설정됨' : '❌ 없음'}
- Project ID: ${process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ 설정됨' : '❌ 없음'}
- Storage Bucket: ${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '✅ 설정됨' : '❌ 없음'}
- Auth Domain: ${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ 설정됨' : '❌ 없음'}

Firebase 설정:
- Auth 객체: ${auth ? '✅ 초기화됨' : '❌ 초기화 안됨'}
- Auth 도메인: ${auth?.config?.authDomain || '없음'}
    `;

    showModal(statusText);
  };

  const handleGoogleLogin = async () => {
    try {
      await login({ method: 'google' });
      showModal('Google 로그인 성공!');
    } catch (error) {
      showModal(`Google 로그인 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showModal('로그아웃 성공!');
    } catch (error) {
      showModal(`로그아웃 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Firebase 연결 테스트
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Firebase 상태 확인 */}
          <Card title="Firebase 상태 확인" className="mb-8">
            <div className="space-y-4">
              <Button onClick={checkFirebaseStatus} variant="primary" className="w-full">
                Firebase 상태 확인
              </Button>
              
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">현재 상태:</h4>
                <div className="text-sm space-y-1">
                  <div>Firebase 사용 가능: {isFirebaseAvailable() ? '✅' : '❌'}</div>
                  <div>인증 상태: {authState.user ? '✅ 로그인됨' : '❌ 로그인 필요'}</div>
                  <div>사용자: {authState.user?.displayName || '없음'}</div>
                  <div>이메일: {authState.user?.email || '없음'}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 인증 테스트 */}
          <Card title="인증 테스트" className="mb-8">
            <div className="space-y-4">
              {authState.user ? (
                <div>
                  <div className="p-4 bg-green-50 rounded mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">로그인됨</h4>
                    <div className="text-sm text-green-700">
                      <div>이름: {authState.user.displayName}</div>
                      <div>이메일: {authState.user.email}</div>
                      <div>ID: {authState.user.uid}</div>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    로그아웃
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="p-4 bg-yellow-50 rounded mb-4">
                    <h4 className="font-semibold text-yellow-800">로그인 필요</h4>
                    <p className="text-sm text-yellow-700">Firebase 기능을 사용하려면 로그인이 필요합니다.</p>
                  </div>
                  <Button onClick={handleGoogleLogin} variant="primary" className="w-full">
                    Google로 로그인
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 결과 모달 */}
      <Modal
        isOpen={isModalOpen}
        title="Firebase 상태"
        onClose={() => setIsModalOpen(false)}
      >
        <pre className="whitespace-pre-wrap text-sm">{modalContent}</pre>
      </Modal>
    </div>
  );
};

export default FirebaseTest; 