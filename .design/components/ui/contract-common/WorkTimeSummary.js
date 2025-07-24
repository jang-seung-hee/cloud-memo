import React from 'react';
import { 
  calcWorkStats,
  calculateMonthlyWorkHours,
  checkInsuranceEligibility,
  checkWeeklyHolidayEligibility,
  timeStrToMinutes
} from '../../../utils/laborRules';
import FormulaTooltip from '../../FormulaTooltip';

// 시간을 "X시간 Y분" 형식으로 변환하는 함수
function getHourStr(mins) {
  if (!mins || mins === 0) return '0시간';
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

function WorkTimeSummary({ form, tooltip = {}, showTooltip, hideTooltip, toggleTooltip, setFormulaData }) {
  const workStats = calcWorkStats(form);
  const weekWorkHours = workStats.totalWeek / 60; // 분을 시간으로 변환
  const monthWorkHours = workStats.totalMonth / 60; // 분을 시간으로 변환
  
  // 근로기준법에 따른 월 소정근로시간 계산 방법 확인
  const safeDays = Array.isArray(form.days) ? form.days : [];
  const weeklyWorkDays = safeDays.filter(day => day && typeof day === 'string').length; // 선택된 근무일 수
  const monthlyCalculation = calculateMonthlyWorkHours(weekWorkHours, weeklyWorkDays);
  
  const insurance = checkInsuranceEligibility(weekWorkHours, monthWorkHours);
  const weeklyHoliday = checkWeeklyHolidayEligibility(weekWorkHours);

  // 주간 근로시간 계산 공식
  const getWeeklyFormula = () => {
    const selectedDays = form.days || [];
    const dayCount = selectedDays.length;
    
    if (form.workTimeType === 'same') {
      const startTime = form.commonStart || '';
      const endTime = form.commonEnd || '';
      const breakTime = form.commonBreak || 0;
      
      // 실제 계산 과정
      const startMinutes = timeStrToMinutes(startTime);
      const endMinutes = timeStrToMinutes(endTime);
      const workMinutes = endMinutes > startMinutes ? endMinutes - startMinutes : (endMinutes + 24 * 60) - startMinutes;
      const actualWorkMinutes = Math.max(0, workMinutes - breakTime);
      const dailyWorkHours = actualWorkMinutes / 60;
      const weeklyWorkMinutes = actualWorkMinutes * dayCount;
      
      return {
        title: '주간 근로시간 계산 공식',
        formula: `주간 근로시간 = Σ(각 근무일 근로시간)`,
        details: [
          `선택된 근무일: ${selectedDays.join(', ')} (${dayCount}일)`,
          `시업시간: ${startTime} (${startMinutes}분)`,
          `종업시간: ${endTime} (${endMinutes}분)`,
          `휴게시간: ${breakTime}분`,
          `하루 근로시간 = (${endMinutes} - ${startMinutes}) - ${breakTime} = ${actualWorkMinutes}분 = ${dailyWorkHours.toFixed(2)}시간`,
          `주간 근로시간 = ${dailyWorkHours.toFixed(2)}시간 × ${dayCount}일 = ${weeklyWorkMinutes}분 = ${weekWorkHours.toFixed(2)}시간`
        ],
        result: `${weekWorkHours.toFixed(2)}시간`
      };
    } else {
      return {
        title: '주간 근로시간 계산 공식',
        formula: `주간 근로시간 = Σ(각 근무일 근로시간)`,
        details: [
          `선택된 근무일: ${selectedDays.join(', ')} (${dayCount}일)`,
          `각 요일별 개별 근무시간 적용`,
          `하루 근로시간 = (종업시간 - 시업시간) - 휴게시간`,
          `주간 근로시간 = Σ(각 요일 근로시간)`
        ],
        result: `${weekWorkHours.toFixed(2)}시간`
      };
    }
  };

  // 월 소정근로시간 계산 공식
  const getMonthlyFormula = () => {
    const safeDays = Array.isArray(form.days) ? form.days : [];
    const weeklyWorkDays = safeDays.filter(day => day && typeof day === 'string').length; // 선택된 근무일 수
    
    if (weekWorkHours >= 15) {
      const weeklyHolidayHours = monthlyCalculation.weeklyHolidayHours;
      const totalWeeklyHours = weekWorkHours + weeklyHolidayHours;
      const monthlyHours = totalWeeklyHours * 4.346;
      
      // 주휴시간 계산 과정
      const calculatedHolidayHours = weekWorkHours / weeklyWorkDays;
      const isMaxApplied = calculatedHolidayHours > 8;
      
      return {
        title: '월 소정근로시간 계산 공식 (15시간 이상)',
        formula: `월 소정근로시간 = (주간 근로시간 + 주휴시간) × 4.346`,
        details: [
          `주간 근로시간: ${weekWorkHours.toFixed(2)}시간`,
          `1주 소정근로일수: ${weeklyWorkDays}일`,
          `주휴시간 계산: ${weekWorkHours.toFixed(2)} ÷ ${weeklyWorkDays} = ${calculatedHolidayHours.toFixed(2)}시간`,
          isMaxApplied 
            ? `주휴시간 최대값 적용: ${calculatedHolidayHours.toFixed(2)}시간 → 8시간 (최대값 초과)`
            : `주휴시간: ${weeklyHolidayHours.toFixed(2)}시간 (최대값 8시간 미만)`,
          `주간 총 유급시간: ${weekWorkHours.toFixed(2)} + ${weeklyHolidayHours.toFixed(2)} = ${totalWeeklyHours.toFixed(2)}시간`,
          `월평균 주수: 4.346주`,
          `월 소정근로시간 = ${totalWeeklyHours.toFixed(2)} × 4.346 = ${monthlyHours.toFixed(2)}시간`
        ],
        result: `${monthlyCalculation.monthlyWorkHours.toFixed(2)}시간`,
        note: '근로기준법: 주 15시간 이상 근로 시 주휴시간 포함'
      };
    } else {
      const monthlyHours = weekWorkHours * 4.346;
      
      return {
        title: '월 소정근로시간 계산 공식 (15시간 미만)',
        formula: `월 소정근로시간 = 주간 근로시간 × 4.346`,
        details: [
          `주간 근로시간: ${weekWorkHours.toFixed(2)}시간`,
          `월평균 주수: 4.346주`,
          `월 소정근로시간 = ${weekWorkHours.toFixed(2)} × 4.346 = ${monthlyHours.toFixed(2)}시간`
        ],
        result: `${monthlyCalculation.monthlyWorkHours.toFixed(2)}시간`,
        note: '근로기준법: 주 15시간 미만 근로 시 주휴시간 없음'
      };
    }
  };

  return (
    <div className="work-time-summary-compact">
      <div className="summary-header">
        <h3 className="summary-title-compact">📊 근로시간 요약</h3>
        <div className="summary-stats-grid">
          <div 
            className="stat-card"
            onClick={(e) => toggleTooltip && toggleTooltip(e, 'weekly')}
            style={{ cursor: toggleTooltip ? 'pointer' : 'default' }}
          >
            <div className="stat-label">주간 근로시간</div>
            <div 
              className="stat-value"
              onClick={(e) => toggleTooltip && toggleTooltip(e, 'weekly')}
              style={{ cursor: toggleTooltip ? 'pointer' : 'default' }}
            >
              <span className="session-value">{getHourStr(workStats.totalWeek)}</span>
            </div>
            <div className="stat-hint" style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
              1일 근로시간 × 주 소정근로일수
            </div>
          </div>
          
          <div 
            className="stat-card"
            onClick={(e) => {
              if (!toggleTooltip) return;
              
              // 월 소정근로시간 계산 결과를 세션에 저장
              const calculationResult = {
                weeklyWorkHours: weekWorkHours,
                weeklyHolidayHours: monthlyCalculation.weeklyHolidayHours,
                monthlyWorkHours: monthlyCalculation.monthlyWorkHours,
                weeklyWorkDays: weeklyWorkDays,
                calculationMethod: monthlyCalculation.calculationMethod
              };
              
              // 세션에 저장
              const workTimeCalculationInfo = {
                weeklyWorkHours: weekWorkHours,
                monthlyWorkHours: monthWorkHours,
                weeklyHolidayHours: monthlyCalculation.weeklyHolidayHours,
                nightWorkHours: workStats.night / 60,
                overtimeWorkHours: workStats.over / 60,
                insuranceEligibility: {
                  isEligible: insurance.isEligible,
                  reason: insurance.reason
                },
                weeklyHolidayEligibility: {
                  isEligible: weeklyHoliday.isEligible,
                  reason: weeklyHoliday.reason
                }
              };
              sessionStorage.setItem('workTimeCalculationInfo', JSON.stringify(workTimeCalculationInfo));
              
              // 툴팁 표시
              toggleTooltip(e, 'monthly');
            }}
            style={{ cursor: toggleTooltip ? 'pointer' : 'default' }}
          >
            <div className="stat-label">월 소정근로시간</div>
            <div className="stat-value"><span className="session-value">{getHourStr(workStats.totalMonth)}</span></div>
            <div className="stat-hint" style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
              주간근로시간*4.346+주휴시간
            </div>            
          </div>
          
          <div className="stat-card">
            <div className="stat-label">주간 야간근로수당</div>
            <div className="stat-value"><span className="session-value">{getHourStr(workStats.night)}</span></div>
            <div className="stat-hint" style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
              22시~06시 근로, 통상임금의 50% 가산 지급
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">주간 연장근로수당</div>
            <div className="stat-value"><span className="session-value">{getHourStr(workStats.over)}</span></div>
            <div className="stat-hint" style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
              1일 8시간, 1주 40시간 초과 시 50% 가산
            </div>
          </div>
        </div>
      </div>
      
      <div className="legal-status-compact">
        <div className="legal-status-header">
          <span className="legal-icon">⚖️</span>
          <span className="legal-title">법적 기준</span>
        </div>
        <div className="legal-status-grid">
          <div className={`legal-badge ${insurance.isEligible ? 'eligible' : 'not-eligible'}`}>
            <span className="badge-icon">{insurance.isEligible ? '✅' : '❌'}</span>
            <span className="badge-text">4대보험 대상자</span>
          </div>
          <div className={`legal-badge ${weeklyHoliday.isEligible ? 'eligible' : 'not-eligible'}`}>
            <span className="badge-icon">{weeklyHoliday.isEligible ? '✅' : '❌'}</span>
            <span className="badge-text">주휴수당 대상자</span>
          </div>
        </div>
        <div className="legal-explanations">
          <div className="legal-explanation-item">
            <div className="explanation-header">
              <span className="explanation-icon">🏥</span>
              <span className="explanation-title">4대보험 의무가입 조건</span>
            </div>
            <div className="explanation-text">{insurance.reason}</div>
            <div className="explanation-criteria">기준: 주 15시간 이상 또는 월 60시간 이상 근로 시, 4대보험 의무가입</div>
          </div>
          <div className="legal-explanation-item">
            <div className="explanation-header">
              <span className="explanation-icon">💰</span>
              <span className="explanation-title">주휴수당 조건</span>
            </div>
            <div className="explanation-text">{weeklyHoliday.reason}</div>
            <div className="explanation-criteria">기준: 1주 15시간 이상 근로 시, 주휴수당 의무 지급</div>
          </div>
        </div>
        <div className="legal-note">
          <small>※ 월평균 4.346주 기준으로 계산됩니다</small>
        </div>
      </div>

      {/* 툴팁 */}
      <FormulaTooltip
        isVisible={tooltip.isVisible}
        position={tooltip.position}
        data={
          tooltip.type === 'weekly' ? getWeeklyFormula() :
          tooltip.type === 'monthly' ? getMonthlyFormula() :
          null
        }
        onClose={hideTooltip}
      />
    </div>
  );
}

export default WorkTimeSummary; 