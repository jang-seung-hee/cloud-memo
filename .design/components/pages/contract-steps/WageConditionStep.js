import React, { useEffect } from 'react';
import { 
  formatNumberWithCommas,
  LEGAL_INFO,
  calcWorkStats,
  calculateMinimumMonthlyWageWithActualHours,
  calculateMinimumWeeklyWage,
  calculateWeeklyHolidayPay,
  separateMonthlyWage,
  separateWeeklyWage
} from '../../../utils/laborRules';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';
import { MonthlyWageLegalGuide, HourlyWageLegalGuide, WeeklyWageLegalGuide } from '../common/WageLegalGuides';

function WageConditionStep({ 
  form, 
  handleChange, 
  stepErrors,
  tooltip,
  showTooltip,
  hideTooltip,
  toggleTooltip,
  setFormulaData
}) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.salaryType || form.baseSalary || form.hourlyWage || form.monthlySalary || form.weeklySalary || form.allowances || form.totalSalary || form.payday || form.paymentMethod)) {
      saveStepDataToSession(6, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(6, form, 500);
    }
  }, [form.salaryType, form.baseSalary, form.hourlyWage, form.monthlySalary, form.weeklySalary, form.allowances, form.totalSalary, form.payday, form.paymentMethod]);

  // 근로시간 정보 유효성 체크
  const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
  const isWorkTimeReady = !!(workTimeCalculationInfo.weeklyWorkHours && workTimeCalculationInfo.monthlyWorkHours);

  return (
    <div className="step-container">
      {/* 안내문구 강조 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>최저임금을 준수하여 임금을 설정해주세요. 시급제와 월급제의 계산 방식이 다르므로 신중히 선택하세요.</p>
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 법적 기준</p>
          <p className="guide-tip-text">• 2025년 최저임금: 10,030원/시간 (월 2,096,270원)<br/>• 주휴수당: 주 40시간 이상 시 8시간 고정, 15~40시간 미만 시 비례 계산<br/>• 연장수당: 시급×0.5×연장시간, 야간수당: 시급×0.5×야간시간</p>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">임금 형태 <span style={{color: 'red'}}>*</span></label>
        <div className="radio-group" style={{display: 'flex', gap: 16}}>
          <label className="radio-label" style={{display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'}}>
            <input 
              type="radio" 
              name="salaryType" 
              value="monthly" 
              checked={form.salaryType === 'monthly'} 
              onChange={handleChange} 
              style={{margin: 0}}
            />
            <span>월급제</span>
          </label>
          <label className="radio-label" style={{display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'}}>
            <input 
              type="radio" 
              name="salaryType" 
              value="weekly" 
              checked={form.salaryType === 'weekly'} 
              onChange={handleChange} 
              style={{margin: 0}}
            />
            <span>주급제</span>
          </label>
          <label className="radio-label" style={{display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'}}>
            <input 
              type="radio" 
              name="salaryType" 
              value="hourly" 
              checked={form.salaryType === 'hourly'} 
              onChange={handleChange} 
              style={{margin: 0}}
            />
            <span>시급제</span>
          </label>
        </div>
        {!form.salaryType && <p style={{color: 'red', fontWeight: 'bold'}}>임금 형태는 필수 선택 항목입니다.</p>}
      </div>

      {form.salaryType === 'monthly' && (
        <div className="form-group">
          <label className="form-label">총 월급 (주휴수당포함) <span style={{color: 'red'}}>*</span></label>
          {/* 월급 입력란 */}
          <div className="form-group">
            <label className="form-label">월급 <span style={{color: 'red'}}>*</span></label>
            <input
              name="monthlySalary"
              type="text"
              value={formatNumberWithCommas(form.monthlySalary)}
              onChange={handleChange}
              className="form-input"
              placeholder="예: 1,850,000"
              disabled={!isWorkTimeReady}
            />
            {!isWorkTimeReady && (
              <p style={{color: 'red', marginTop: 4}}>5단계 근로시간 정보를 먼저 입력해 주세요.</p>
            )}
          </div>
          {(() => {
            const hourlyWage = LEGAL_INFO.MIN_WAGE;
            const minimumWage = calculateMinimumMonthlyWageWithActualHours(form, hourlyWage);
            return (
              <>
                <p className="form-help">
                  근무시간 등을 고려할 때 최저 총 월급은 <strong>{minimumWage.totalMinimumWage.toLocaleString()}원</strong> 이상으로 설정되어야 합니다.
                </p>
                <div style={{
                  marginTop: 8,
                  padding: 10,
                  backgroundColor: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#475569'
                }}>
                  <p 
                    style={{
                      margin: '0 0 4px 0', 
                      fontWeight: 'bold', 
                      color: '#374151'
                    }}
                  >
                    📊 최저 총 월급 계산 근거:
                  </p>
                  <ul style={{margin: 0, paddingLeft: 16, lineHeight: 1.4}}>
                    <li>월 소정근로시간: {minimumWage.monthlyWorkHours}시간</li>
                    <li>기본 최저임금: {minimumWage.monthlyWorkHours}시간 × 10,030원 = {minimumWage.basicMinimumWage.toLocaleString()}원</li>
                    {minimumWage.weeklyHolidayPay > 0 && (
                      <li>주휴수당: {LEGAL_INFO.MIN_WAGE.toLocaleString()}원 × {minimumWage.weeklyHolidayHours}시간/주 × 4.346주 = {minimumWage.weeklyHolidayPay.toLocaleString()}원</li>
                    )}
                    <li><strong>최저 총 월급: {minimumWage.totalMinimumWage.toLocaleString()}원</strong></li>
                  </ul>
                </div>
                <div style={{
                  marginTop: 8,
                  padding: 10,
                  backgroundColor: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  color: '#475569'
                }}>
                  <p style={{margin: 0, lineHeight: 1.4}}>
                    입력하신 총 월급 <strong>{Number(form.monthlySalary || 0).toLocaleString()}원</strong>을 기준으로 한다면, 제수당, 연장수당이 추가로 붙을 경우 실제 월급은 더 커집니다. 예상 되는 실제 월급 총액은 아래의 "■ 예상 월급 명세서 내용을 참고 하세요
                  </p>
                </div>
              </>
            );
          })()}
          
          <div className="form-group" style={{marginTop: 16}}>
            <label className="form-label">제수당</label>
            <input 
              name="allowances" 
              type="text" 
              value={formatNumberWithCommas(form.allowances || '0')} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="예: 200,000"
            />
            <p className="form-help">식대, 교통비, 복리후생비 등 (선택사항)</p>
          </div>

          {/* 월급제 법적 기준 안내 */}
          {form.monthlySalary && (
            <MonthlyWageLegalGuide 
              form={form} 
              showTooltip={showTooltip}
              setFormulaData={setFormulaData}
            />
          )}
        </div>
      )}

      {form.salaryType === 'hourly' && (
        <div className="form-group">
          <label className="form-label">시급 <span style={{color: 'red'}}>*</span></label>
          {/* 시급 입력란 */}
          <div className="form-group">
            <label className="form-label">시급</label>
            <input
              name="hourlyWage"
              type="text"
              value={formatNumberWithCommas(form.hourlyWage)}
              onChange={handleChange}
              className="form-input"
              placeholder="예: 10,000"
              disabled={!isWorkTimeReady}
            />
            {!isWorkTimeReady && (
              <p style={{color: 'red', marginTop: 4}}>5단계 근로시간 정보를 먼저 입력해 주세요.</p>
            )}
          </div>
          <p className="form-help">최저임금(10,030원/시간) 이상으로 설정해주세요</p>
          
          <div className="form-group" style={{marginTop: 16}}>
            <label className="form-label">제수당</label>
            <input 
              name="allowances" 
              type="text" 
              value={formatNumberWithCommas(form.allowances || '0')} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="예: 200,000"
            />
            <p className="form-help">식대, 교통비, 복리후생비 등 (선택사항)</p>
          </div>
          
          {/* 시급제 법적 기준 안내 */}
          {form.hourlyWage && (
            <HourlyWageLegalGuide 
              form={form}
              showTooltip={showTooltip}
              setFormulaData={setFormulaData}
            />
          )}
        </div>
      )}

      {form.salaryType === 'weekly' && (
        <div className="form-group">
          <label className="form-label">총 주급 (주휴수당포함) <span style={{color: 'red'}}>*</span></label>
          {/* 주급 입력란 */}
          <div className="form-group">
            <label className="form-label">주급</label>
            <input
              name="weeklySalary"
              type="text"
              value={formatNumberWithCommas(form.weeklySalary)}
              onChange={handleChange}
              className="form-input"
              placeholder="예: 430,000"
              disabled={!isWorkTimeReady}
            />
            {!isWorkTimeReady && (
              <p style={{color: 'red', marginTop: 4}}>5단계 근로시간 정보를 먼저 입력해 주세요.</p>
            )}
          </div>
          <p className="form-help">근무시간 등을 고려할 때 최저 총 주급은 <strong>{(() => {
            const minimumWage = calculateMinimumWeeklyWage(form);
            return minimumWage.totalMinimumWage.toLocaleString();
          })()}원</strong> 이상으로 설정되어야 합니다.</p>
          
          <div className="form-group" style={{marginTop: 16}}>
            <label className="form-label">제수당</label>
            <input 
              name="allowances" 
              type="text" 
              value={formatNumberWithCommas(form.allowances || '0')} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="예: 50,000"
            />
            <p className="form-help">식대, 교통비, 복리후생비 등 (선택사항)</p>
          </div>
          
          {/* 주급제 법적 기준 안내 */}
          {form.weeklySalary && (
            <WeeklyWageLegalGuide 
              form={form}
              showTooltip={showTooltip}
              setFormulaData={setFormulaData}
            />
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">지급일</label>
        <input 
          name="payday" 
          type="number" 
          value={form.payday} 
          onChange={handleChange} 
          className="form-input" 
          placeholder="예: 25" 
          min="1" 
          max="31"
        />
        <p className="form-help">매월 임금을 지급할 날짜를 입력해주세요 (1-31일)</p>
      </div>

      <div className="form-group">
        <label className="form-label">지급 방법</label>
        <select 
          name="paymentMethod" 
          value={form.paymentMethod} 
          onChange={handleChange} 
          className="form-input"
        >
          <option value="계좌이체">계좌이체</option>
          <option value="현금">현금</option>
          <option value="수표">수표</option>
        </select>
      </div>
    </div>
  );
}

export default WageConditionStep; 