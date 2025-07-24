import React, { useEffect } from 'react';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function ContractPeriodStep({ form, handleChange, stepErrors }) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.periodStart || form.periodEnd || form.probationPeriod || form.probationDiscount)) {
      saveStepDataToSession(3, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(3, form, 500);
    }
  }, [form.periodStart, form.periodEnd, form.probationPeriod, form.probationDiscount]);

  return (
    <div className="step-container">
      {/* 안내문구 강조 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>근로계약의 기간을 명확히 설정해주세요. 기간제 계약과 무기한 계약의 법적 효과가 다르므로 신중히 결정하세요.</p>
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 법적 기준</p>
          <ul className="guide-tip-text" style={{margin: 0, paddingLeft: 18, listStyle: 'disc'}}>
            <li>계약 종료일을 비워두면 무기한 계약이 됩니다</li>
            <li>기간제 근로자 보호법: 2년 초과 기간제 계약은 무기한 계약으로 전환</li>
          </ul>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">계약 시작일 <span style={{color: 'red'}}>*</span></label>
        <input 
          name="periodStart" 
          type="date" 
          value={form.periodStart} 
          onChange={handleChange} 
          className="form-input" 
          style={{borderColor: !form.periodStart ? 'red' : undefined}}
        />
        {!form.periodStart && <p style={{color: 'red', fontWeight: 'bold'}}>계약 시작일은 필수 입력 항목입니다.</p>}
      </div>

      <div className="form-group">
        <label className="form-label">계약 종료일</label>
        <input 
          name="periodEnd" 
          type="date" 
          value={form.periodEnd} 
          onChange={handleChange} 
          className="form-input" 
        />
        <p className="form-help">기간제 계약의 경우 종료일을, 무기한 계약의 경우 비워두세요</p>
      </div>
    </div>
  );
}

export default ContractPeriodStep; 