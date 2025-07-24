import React, { useEffect } from 'react';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function StoreInfoStep({ form, handleChange, handleAddressSearch, stepErrors }) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.storeName || form.owner || form.address || form.addressDetail || form.storeContact)) {
      saveStepDataToSession(1, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(1, form, 500);
    }
  }, [form.storeName, form.owner, form.address, form.addressDetail, form.storeContact]);

  return (
    <div className="step-container">
      {/* 안내문구 강조 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>사업장의 정확한 정보를 입력해주세요. 이 정보는 근로계약서의 당사자 정보로 사용되며, 법적 분쟁 시 중요한 근거가 됩니다.</p>
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 실무 팁</p>
          <p className="guide-tip-text">• 사업장명은 사업자등록증에 기재된 명칭과 일치해야 합니다<br/>• 대표자명은 법인등기부등본 또는 사업자등록증을 확인하세요<br/>• 주소는 도로명주소를 사용하는 것이 좋습니다</p>
        </div>
      </div>
      
      {/* 입력 필드 예시: 필수 * 표시, 미입력 시 경고 */}
      <div className="form-group">
        <label className="form-label">사업장명 <span style={{color: 'red'}}>*</span></label>
        <input 
          name="storeName" 
          value={form.storeName} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="예: OO카페, OO식당" 
          style={{borderColor: !form.storeName ? 'red' : undefined}}
        />
        {!form.storeName && <p style={{color: 'red', fontWeight: 'bold'}}>사업장명은 필수 입력 항목입니다.</p>}
        <p className="form-help">사업장의 정식 명칭을 입력해주세요</p>
      </div>

      <div className="form-group">
        <label className="form-label">대표자명</label>
        <input 
          name="owner" 
          value={form.owner} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="대표자 성명" 
        />
      </div>

      <div className="form-group">
        <label className="form-label">사업장 주소</label>
        <div className="address-input-group">
          <input 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            className="form-input address-main" 
            placeholder="도로명 주소" 
          />
          <button 
            type="button" 
            onClick={handleAddressSearch} 
            className="address-search-btn"
          >
            주소찾기
          </button>
        </div>
        <input 
          name="addressDetail" 
          value={form.addressDetail} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="상세주소 (건물명, 층수 등)" 
        />
      </div>

      <div className="form-group">
        <label className="form-label">사업장 연락처</label>
        <input 
          name="storeContact" 
          value={form.storeContact} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="02-0000-0000" 
        />
      </div>
    </div>
  );
}

export default StoreInfoStep; 