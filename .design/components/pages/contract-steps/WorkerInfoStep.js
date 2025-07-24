import React, { useEffect } from 'react';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function WorkerInfoStep({ form, handleChange, setForm, stepErrors }) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.name || form.birth || form.contact || form.workerAddress || form.workerAddressDetail)) {
      saveStepDataToSession(2, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(2, form, 500);
    }
  }, [form.name, form.birth, form.contact, form.workerAddress, form.workerAddressDetail]);

  return (
    <div className="step-container">
      {/* 안내문구 강조 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>근로자의 개인정보를 정확히 입력해주세요. 주민등록상의 정보와 일치해야 하며, 개인정보보호법에 따라 안전하게 관리됩니다.</p>
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 법적 요건</p>
          <p className="guide-tip-text">• 근로기준법 제17조: 근로계약서에는 근로자의 성명이 포함되어야 합니다<br/>• 만 18세 미만자는 보호자 동의가 필요할 수 있습니다<br/>• 주민등록번호는 선택사항이며, 생년월일만으로도 충분합니다</p>
        </div>
      </div>
      
      {/* 입력 필드 예시: 필수 * 표시, 미입력 시 경고 */}
      <div className="form-group">
        <label className="form-label">근로자 성명 <span style={{color: 'red'}}>*</span></label>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="성명" 
          style={{borderColor: !form.name ? 'red' : undefined}}
        />
        {!form.name && <p style={{color: 'red', fontWeight: 'bold'}}>근로자 성명은 필수 입력 항목입니다.</p>}
      </div>

      <div className="form-group">
        <label className="form-label">생년월일</label>
        <input 
          name="birth" 
          type="date" 
          value={form.birth} 
          onChange={handleChange} 
          className="form-input" 
        />
      </div>

      <div className="form-group">
        <label className="form-label">근로자 주소</label>
        <div className="address-input-group">
          <input 
            name="workerAddress" 
            value={form.workerAddress} 
            onChange={handleChange} 
            className="form-input address-main" 
            placeholder="도로명 주소" 
          />
          <button 
            type="button" 
            onClick={() => {
              if (window.daum && window.daum.Postcode) {
                new window.daum.Postcode({
                  oncomplete: function(data) {
                    setForm(prev => ({
                      ...prev,
                      workerAddress: data.address,
                      workerAddressDetail: ''
                    }));
                  }
                }).open();
              } else {
                alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
              }
            }} 
            className="address-search-btn"
          >
            주소찾기
          </button>
        </div>
        <input 
          name="workerAddressDetail" 
          value={form.workerAddressDetail} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="상세주소 (건물명, 층수 등)" 
        />
      </div>

      <div className="form-group">
        <label className="form-label">연락처</label>
        <input 
          name="contact" 
          value={form.contact} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="010-0000-0000" 
        />
        <p className="form-help">휴대폰 번호를 입력해주세요</p>
      </div>
    </div>
  );
}

export default WorkerInfoStep; 