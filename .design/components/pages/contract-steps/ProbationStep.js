import React, { useEffect } from 'react';
import { 
  formatNumberWithCommas,
  parseNumberFromCommas,
  LEGAL_INFO,
  calculateProbationSalary,
  getProbationMinimumWage,
  calcWorkStats,
  calculateMinimumMonthlyWageWithActualHours,
  calculateMinimumWeeklyWage,
  calculateWeeklyHolidayPay,
  separateMonthlyWage,
  separateWeeklyWage,
  calculateProbationStandardWage,
  checkProbationWageWarning,
  getWageInfoFromSession
} from '../../../utils/laborRules';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function ProbationStep({ 
  form, 
  handleChange, 
  setForm, 
  stepErrors 
}) {
  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.probationPeriod || form.probationDiscount)) {
      saveStepDataToSession(7, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(7, form, 500);
    }
  }, [form.probationPeriod, form.probationDiscount]);

  return (
    <div className="step-container">
      {/* 작성 가이드: 파란색 박스 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>수습기간은 근로자의 업무 적응 및 능력 평가를 위한 기간입니다. 1년 이상 계약에서만 설정 가능하며, 최저임금의 90% 이상을 보장합니다.</p>
        {/* 법적 기준: 회색 박스 (파란 박스 내부로 이동) */}
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e', marginBottom: 0, marginTop: 8}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', color: '#334155', marginBottom: 2}}>💡 법적 기준</p>
          <ul className="guide-tip-text" style={{margin: 0, paddingLeft: 18, listStyle: 'disc'}}>
            <li>수습기간은 최대 3개월까지 가능 (근로기준법 제35조)</li>
            <li>1년 이상 계약 또는 무기한 계약에서만 설정 가능</li>
            <li>수습기간 중 최저임금의 90% 이상 지급 가능</li>
            <li>수습기간 중에도 정당한 이유 없는 해고는 부당해고</li>
          </ul>
        </div>
      </div>
      
      {/* 수습기간 불가 안내문 */}
      {(() => {
        // 계약 기간 계산
        const startDate = new Date(form.periodStart);
        const endDate = form.periodEnd ? new Date(form.periodEnd) : null;
        const isIndefinite = !form.periodEnd; // 무기한 계약
        let isOneYearOrMore = false;
        if (endDate) {
          const diffTime = endDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          isOneYearOrMore = diffDays >= 365;
        }
        const isEligible = isIndefinite || isOneYearOrMore;
        
        if (!isEligible) {
          return (
            <div style={{
              background: '#e0f2fe',
              borderLeft: '5px solid #2563eb',
              borderRadius: 8,
              padding: 16,
              color: '#d97706',
              fontSize: '15px',
              marginBottom: 16
            }}>
              현재 근로계약기간이 1년 미만이라 수습기간을 정할 수 없습니다. 계약 기간을 1년 이상으로 변경하거나 무기한 계약으로 설정하면 수습기간을 입력할 수 있습니다.
              {endDate && (
                <div style={{ marginTop: 8, color: '#d97706', fontSize: '14px' }}>
                  현재 근로계약기간: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))}일
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}
      
      {(() => {
        // 계약 기간 계산
        const startDate = new Date(form.periodStart);
        const endDate = form.periodEnd ? new Date(form.periodEnd) : null;
        const isIndefinite = !form.periodEnd; // 무기한 계약
        let isOneYearOrMore = false;
        if (endDate) {
          const diffTime = endDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          isOneYearOrMore = diffDays >= 365;
        }
        const isEligible = isIndefinite || isOneYearOrMore;
        if (!isEligible) {
          // 수습 불가 시 값 리셋
          if (form.probationPeriod || form.probationDiscount) {
            setForm(prev => ({
              ...prev,
              probationPeriod: '',
              probationDiscount: ''
            }));
          }
          // 수습기간 불가 안내문은 이미 위에서 표시됨
          return null;
        }

        return (
          <>
            <div className="form-group">
              <label className="form-label">수습기간</label>
              <select 
                name="probationPeriod" 
                value={form.probationPeriod} 
                onChange={handleChange} 
                className="form-input"
              >
                <option value="">수습기간 없음</option>
                <option value="1개월">1개월</option>
                <option value="2개월">2개월</option>
                <option value="3개월">3개월</option>
              </select>
              <p className="form-help">수습기간을 설정하지 않으면 정상 임금이 지급됩니다</p>
            </div>
            
            {/* 수습기간 감액률 선택 */}
            {form.probationPeriod && (
              <div className="form-group">
                <label className="form-label">수습기간 임금 감액률</label>
                <select 
                  name="probationDiscount" 
                  value={form.probationDiscount} 
                  onChange={handleChange} 
                  className="form-input"
                >
                  <option value="10">10% 감액</option>
                  <option value="15">15% 감액</option>
                  <option value="20">20% 감액</option>
                  <option value="25">25% 감액</option>
                  <option value="30">30% 감액</option>
                </select>
                
                {/* 수습기간 임금 계산 결과 표시 */}
                {(() => {
                  const workStats = calcWorkStats(form);
                  const monthlyWorkHours = workStats.totalMonth / 60;
                  const weeklyWorkHours = workStats.totalWeek / 60;
                  const allowances = parseNumberFromCommas(form.allowances || '0');
                  
                  // 세션에서 기본급과 주휴수당 정보 가져오기
                  const wageInfo = getWageInfoFromSession();
                  let basicWage = 0;
                  let weeklyHolidayPay = 0;
                  
                  if (wageInfo && wageInfo.wageBreakdown) {
                    basicWage = wageInfo.wageBreakdown.basicWage || 0;
                    weeklyHolidayPay = wageInfo.wageBreakdown.weeklyHolidayPay || 0;
                  } else {
                    // 세션에 정보가 없으면 실시간 계산
                    if (form.salaryType === 'hourly') {
                      basicWage = Math.round(Number(form.hourlyWage) * monthlyWorkHours);
                      weeklyHolidayPay = calculateWeeklyHolidayPay(Number(form.hourlyWage), weeklyWorkHours);
                    } else if (form.salaryType === 'weekly') {
                      const weeklyBreakdown = separateWeeklyWage(Number(form.weeklySalary));
                      basicWage = weeklyBreakdown.basicWage;
                      weeklyHolidayPay = weeklyBreakdown.weeklyHolidayPay;
                    } else {
                      const monthlyBreakdown = separateMonthlyWage(Number(form.monthlySalary));
                      basicWage = monthlyBreakdown.basicWage;
                      weeklyHolidayPay = monthlyBreakdown.weeklyHolidayPay;
                    }
                  }
                  
                  // 소정근로대가 (기본급 + 주휴수당)
                  const standardWage = basicWage + weeklyHolidayPay;
                  
                  // 수습기간 소정근로대가 (새로운 규칙: (기본급 + 주휴수당) × 감액률, 단 최저임금 90% 하한선 적용)
                  const probationStandardWage = calculateProbationStandardWage(
                    basicWage,
                    weeklyHolidayPay,
                    form.probationDiscount,
                    form.salaryType,
                    monthlyWorkHours,
                    weeklyWorkHours,
                    workStats.over / 60, // 주간 연장근로수당
                    workStats.night / 60 // 주간 야간근로수당
                  );
                  
                  // 수습기간 총 임금
                  const probationTotalWage = probationStandardWage + allowances;
                  
                  // 수습기간 임금 경고 확인
                  const wageWarning = checkProbationWageWarning(
                    basicWage,
                    weeklyHolidayPay,
                    allowances,
                    form.probationDiscount,
                    form.salaryType,
                    monthlyWorkHours,
                    weeklyWorkHours,
                    workStats.over / 60, // 주간 연장근로수당
                    workStats.night / 60 // 주간 야간근로수당
                  );

                  return (
                    <div style={{
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: '#f0f9ff',
                      borderRadius: 6,
                      border: '1px solid #0ea5e9',
                      fontSize: '13px'
                    }}>
                      <p style={{margin: 0, fontWeight: 'bold', color: '#0c4a6e'}}>💰 수습기간 임금 계산:</p>
                      <div style={{margin: '4px 0 0 0', color: '#0c4a6e', lineHeight: '1.6'}}>
                        <div><strong>기본급:</strong> <span className="session-value">{basicWage.toLocaleString()}원</span></div>
                        <div><strong>주휴수당:</strong> <span className="session-value">{weeklyHolidayPay.toLocaleString()}원</span></div>
                        <div><strong>소정근로대가:</strong> <span className="session-value">{standardWage.toLocaleString()}원</span> (기본급 + 주휴수당)</div>
                        <div style={{borderTop: '1px solid #0ea5e9', marginTop: '8px', paddingTop: '8px'}}>
                          <div><strong>수습기간 중 근로대가:</strong> <span className="session-value">{Math.round(probationStandardWage).toLocaleString()}원</span> (기본급+주휴수당 {form.probationDiscount}% 감액, 최저임금 90% 하한선 적용)</div>
                          <div><strong>수습기간 중 제수당:</strong> <span className="session-value">{allowances.toLocaleString()}원</span></div>
                          <div style={{fontSize: '20px', fontWeight: 'bold', color:'rgb(18, 52, 207)', marginTop: '8px'}}><strong>수습기간 중 총 임금:</strong> <span className="session-value">{wageWarning.appliedTotal.toLocaleString()}원</span></div>
                        </div>
                        
                        {/* 경고 메시지 표시 */}
                        {wageWarning.hasWarning && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #f87171',
                            borderRadius: '6px',
                            color: '#b91c1c',
                            fontSize: '12px',
                            lineHeight: '1.4'
                          }}
                          dangerouslySetInnerHTML={{ __html: wageWarning.warningMessage }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* 법적 안내 */}
            {form.probationPeriod && (
              <div style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: '#fef3c7',
                borderRadius: 6,
                border: '1px solid #f59e0b',
                fontSize: '13px',
                color: '#92400e'
              }}>
                <p style={{margin: 0, fontWeight: 'bold'}}>💡 수습기간 법적 안내:</p>
                <ul style={{margin: '4px 0 0 0', paddingLeft: 16}}>
                  <li>1년 이상 근로계약시에만 설정 가능</li>
                  <li>담당 업무가 단순노무직은 수습기간 동안 감액을 할 수 없음</li>
                  <li>(청소원, 주방 보조, 배달원, 주유원, 식당 서빙 등)</li>
                  <li>수습기간 중에도 정당한 이유 없는 해고는 부당해고</li>
                </ul>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}

export default ProbationStep; 