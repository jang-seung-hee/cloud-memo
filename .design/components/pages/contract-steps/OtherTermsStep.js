import React, { useEffect } from 'react';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function OtherTermsStep({ 
  form, 
  handleChange, 
  stepErrors 
}) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.socialInsurance !== undefined || form.terminationTypes?.length > 0 || form.termination || form.confidentiality !== undefined || form.contractCopies || form.otherConditions)) {
      saveStepDataToSession(8, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(8, form, 500);
    }
  }, [form.socialInsurance, form.terminationTypes, form.termination, form.confidentiality, form.contractCopies, form.otherConditions]);

  return (
    <div className="step-container">
      {/* 작성 가이드: 파란색 박스 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>임금지급일, 지급방법, 기타 특별한 조건 등을 설정해주세요. 이는 계약의 구체적인 이행 방법을 명확히 합니다.</p>
        {/* 실무 팁: 회색 박스 */}
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 실무 팁</p>
          <p className="guide-tip-text">• 임금지급일은 매월 정기적으로 설정하세요<br/>• 계좌이체를 권장하며, 현금 지급 시 영수증을 발급하세요<br/>• 기타 조건은 구체적이고 명확하게 작성하세요</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">4대보험 가입</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="socialInsurance" 
              checked={form.socialInsurance} 
              onChange={handleChange} 
            />
            <span>4대보험(국민연금, 건강보험, 고용보험, 산재보험) 가입</span>
          </label>
        </div>
        <p className="form-help">근로기준법에 따라 4대보험 가입이 의무입니다</p>
      </div>

      <div className="form-group">
        <label className="form-label">계약 해지 조건</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="terminationTypes" 
              value="mutual_agreement" 
              checked={form.terminationTypes?.includes('mutual_agreement')} 
              onChange={handleChange} 
            />
            <span>상호 합의에 의한 해지</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="terminationTypes" 
              value="employer_notice" 
              checked={form.terminationTypes?.includes('employer_notice')} 
              onChange={handleChange} 
            />
            <span>사용자 사전 통지에 의한 해지</span>
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="terminationTypes" 
              value="worker_resignation" 
              checked={form.terminationTypes?.includes('worker_resignation')} 
              onChange={handleChange} 
            />
            <span>근로자 사직</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">계약 해지 시 사전 통지 기간</label>
        <input 
          name="termination" 
          value={form.termination} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="예: 30일 전 서면 통지"
        />
        <p className="form-help">계약 해지 시 사전 통지 기간을 명시해주세요</p>
      </div>

      <div className="form-group">
        <label className="form-label">비밀유지 의무</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="confidentiality" 
              checked={form.confidentiality} 
              onChange={handleChange} 
            />
            <span>업무상 알게 된 비밀을 유지할 의무</span>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">계약서 작성 부수</label>
        <select 
          name="contractCopies" 
          value={form.contractCopies} 
          onChange={handleChange} 
          className="form-input"
        >
          <option value="2">2부</option>
          <option value="3">3부</option>
          <option value="4">4부</option>
        </select>
        <p className="form-help">계약서 작성 부수를 선택해주세요 (기본: 2부)</p>
      </div>
      
      <div className="form-group">
        <label className="form-label">기타 조건</label>
        <textarea 
          name="otherConditions" 
          value={form.otherConditions} 
          onChange={handleChange} 
          className="form-input" 
          rows="4"
          placeholder="예: 복리후생, 교육훈련, 비밀유지, 경업금지 등"
        />
        <p className="form-help">계약에 특별히 포함할 조건이 있다면 작성해주세요 (선택사항)</p>
      </div>
    </div>
  );
}

export default OtherTermsStep; 