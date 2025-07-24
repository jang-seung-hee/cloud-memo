import React from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="home-container dark:bg-gray-900">
      <div className="home-content">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title dark:text-gray-100">
            사장님은 법대로</h1>
          <p className="hero-subtitle dark:text-gray-300">
            곧 직원쓸 예정인, 초보 사장님의 법 잘알 도우미</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="action-button primary dark:bg-gray-800 dark:text-blue-400"
            onClick={() => navigate('/contract')}
          >
            <span className="button-icon">📄</span>
            <span className="button-text">
              <span className="button-title dark:text-blue-300">근로계약서 만들기</span>
              <span className="button-description dark:text-gray-300">법적 안전을 위한 맞춤형 계약서</span>
            </span>
            <span className="button-arrow">→</span>
          </button>
          
          <button 
            className="action-button secondary dark:bg-gray-800 dark:text-green-300"
            onClick={() => navigate('/allowance-menu')}
          >
            <span className="button-icon">💰</span>
            <span className="button-text">
              <span className="button-title dark:text-green-300">직원 뽑으려면 얼마나 들까?</span>
              <span className="button-description dark:text-gray-300">정확한 임금 계산 도구</span>
            </span>
            <span className="button-arrow">→</span>
          </button>
        </div>

        {/* QR코드: home-footer의 글귀 바로 위에 중앙 배치 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 0 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee' }}>
            <QRCode value="https://whimsical-raindrop-cf7019.netlify.app/" size={88} level="L" />
            <span style={{ fontSize: 12, color: '#666', marginTop: 8 }}>외부 배포 바로가기</span>
          </div>
        </div>
        {/* Footer */}
        <div className="home-footer">
          <p className="footer-text">신뢰할 수 있는 비즈니스 파트너</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 