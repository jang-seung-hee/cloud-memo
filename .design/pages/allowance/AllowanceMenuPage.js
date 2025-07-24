import React from 'react';
import { useNavigate } from 'react-router-dom';

function AllowanceMenu() {
  const navigate = useNavigate();
  
  return (
    <div className="contract-form-page">
      <div className="contract-form-container">
        <div className="form-header">
          <button className="back-btn" onClick={() => navigate('/')}>홈</button>
          <div className="form-title">직원 뽑으려면 얼마나 들까?</div>
          <div className="header-spacer" />
        </div>
        <div className="step-content">
          <div className="step-container">
            <div className="step-header">
              <div className="step-title">계산 방식을 선택하세요</div>
              <div className="step-description">원하시는 계산 방식을 선택하여 정확한 임금 계산을 도와드립니다.</div>
            </div>
            
            <div className="allowance-menu-options" style={{marginTop: 32}}>
              <button 
                className="allowance-menu-option"
                onClick={() => navigate('/allowance/budget')}
              >
                <div className="option-number">1</div>
                <div className="option-content">
                  <div className="option-title">얼마 정도 있으면 될까?</div>
                  <div className="option-description">급여 뿐만 아니라, 4대 보험료, 주휴수당까지 다 따져보자</div>
                </div>
                <div className="option-arrow">→</div>
              </button>
              
              <button 
                className="allowance-menu-option"
                onClick={() => navigate('/allowance/monthly')}
              >
                <div className="option-number">2</div>
                <div className="option-content">
                  <div className="option-title">정규직(계약직) 인건비 계산</div>
                  <div className="option-description">월 단위 임금 계산 및 법적 검증</div>
                </div>
                <div className="option-arrow">→</div>
              </button>
              
              <button 
                className="allowance-menu-option"
                onClick={() => navigate('/allowance/hourly')}
              >
                <div className="option-number">3</div>
                <div className="option-content">
                  <div className="option-title">파트타임(시급) 인건비 계산</div>
                  <div className="option-description">시간 단위 임금 계산 및 수당 산정</div>
                </div>
                <div className="option-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllowanceMenu; 