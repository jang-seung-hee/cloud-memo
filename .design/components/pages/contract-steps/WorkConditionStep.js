import React, { useEffect } from 'react';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function WorkConditionStep({ form, handleChange, stepErrors }) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.workLocation || form.jobDesc || form.position)) {
      saveStepDataToSession(4, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(4, form, 500);
    }
  }, [form.workLocation, form.jobDesc, form.position]);

  return (
    <div className="step-container">
      {/* 작성 가이드: 파란색 박스 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>근무 장소와 업무 내용을 구체적으로 명시해주세요. 이는 근로자의 권리와 의무를 명확히 하고, 추후 업무 범위 변경 시 참고 자료가 됩니다.</p>
        {/* 실무 팁: 회색 박스 */}
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e', marginTop: 8}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', color: '#334155', marginBottom: 2}}>💡 실무 팁</p>
          <p className="guide-tip-text">• 근무장소는 구체적인 주소나 건물명을 명시하세요<br/>• 업무내용은 담당 업무의 핵심을 간단명료하게 작성하세요<br/>• 직책은 회사 내 조직도에 맞는 명칭을 사용하세요</p>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">근무 장소</label>
        <input 
          name="workLocation" 
          value={form.workLocation} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="근무할 장소 (예: 본사, 지점 등)" 
        />
        <p className="form-help">기본적으로 사업장 주소와 동일하지만, 별도 지정 장소가 있다면 입력해주세요</p>
      </div>

      <div className="form-group">
        <label className="form-label">업무 내용</label>
        <input 
          name="jobDesc" 
          value={form.jobDesc} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="예: 웹 개발, 영업, 사무 지원, 주방 보조 등" 
        />
        <p className="form-help">담당할 업무를 구체적으로 입력해주세요</p>
      </div>

      <div className="form-group">
        <label className="form-label">직위/직책</label>
        <input 
          name="position" 
          value={form.position} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="예: 사원, 대리, 과장, 주임 등" 
        />
      </div>
    </div>
  );
}

export default WorkConditionStep; 