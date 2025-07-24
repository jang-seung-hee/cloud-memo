import React from 'react';
import { 
  calcWorkStats, 
  separateMonthlyWage, 
  separateHourlyWage, 
  separateWeeklyWage,
  separateMonthlyWageByActualHours,
  calculateMinimumMonthlyWageWithActualHours,
  calculateMinimumWeeklyWage,
  saveWageInfoToSession,
  saveMonthlyWageCalculationToSession,
  parseNumberFromCommas,
  LEGAL_INFO,
  formatNumberWithCommas
} from '../../../utils/laborRules';
import { calculateMouseTooltipPosition } from '../../../utils/tooltipUtils';

// 월급제 법적 기준 안내 컴포넌트
function MonthlyWageLegalGuide({ form, showTooltip, setFormulaData }) {
  if (form.salaryType !== 'monthly' || !form.monthlySalary) {
    return null;
  }
  const allowances = parseNumberFromCommas(form.allowances) || 0;
  
  // 월급제에서는 입력된 월급이 이미 주휴수당을 포함한 금액이므로, 
  // 법적 최소 임금 계산 시 주휴수당을 별도로 계산하지 않고 입력된 월급을 그대로 사용
  const workStats = calcWorkStats(form);
  const inputWage = parseNumberFromCommas(form.monthlySalary) || 0;
  const totalInputWage = inputWage + allowances;
  
  console.log('입력값 파싱 결과:', {
    originalMonthlySalary: form.monthlySalary,
    parsedInputWage: inputWage,
    originalAllowances: form.allowances,
    parsedAllowances: allowances
  });
  
  // 월급제용 법적 최소 임금 계산 (주휴수당 중복 계산 방지)
  const minimumWage = calculateMinimumMonthlyWageWithActualHours(form, LEGAL_INFO.MIN_WAGE);
  const isCompliant = totalInputWage >= minimumWage.totalMinimumWage;

  // [1] 총 임금(예상) 계산: 입력 월급(주휴수당 포함) + 제수당 + 야간/연장근로수당
  const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
  const nightWorkHours = workTimeCalculationInfo.nightWorkHours || 0;
  const overtimeWorkHours = workTimeCalculationInfo.overtimeWorkHours || 0;
  
  // [2] 실제 근무시간 기반으로 기본급과 주휴수당 분리 계산 (표시용)
  const monthlyWorkHours = workStats.totalMonth / 60;
  const weeklyWorkHours = workStats.totalWeek / 60;
  const weeklyWorkDays = (() => {
    const safeDays = Array.isArray(form.days) ? form.days : [];
    return safeDays.filter(day => day && typeof day === 'string').length;
  })();
  
  console.log('월급제 계산 디버깅:', {
    inputWage,
    weeklyWorkHours,
    weeklyWorkDays,
    monthlyWorkHours,
    nightWorkHours,
    overtimeWorkHours
  });
  
  const wageBreakdown = separateMonthlyWageByActualHours(inputWage, weeklyWorkHours, weeklyWorkDays);
  
  console.log('wageBreakdown 결과:', wageBreakdown);
  
  // [3] 시급 계산 (분리된 기본급에서 계산)
  const calculatedHourlyWage = wageBreakdown.calculationBasis.hourlyWage;
  
  // 연장근로수당 계산 (시급 × 0.5 × 연장시간 × 4.346주)
  const overtimePay = calculatedHourlyWage * 0.5 * overtimeWorkHours * 4.346;
  
  // 야간근로수당 계산 (시급 × 0.5 × 야간시간 × 4.346주)
  const nightPay = calculatedHourlyWage * 0.5 * nightWorkHours * 4.346;
  
  // 총 월 예상 임금 계산 (문자열 연결 방지)
  const totalMonthlyWage = Number(inputWage) + Number(allowances) + Number(overtimePay) + Number(nightPay);
  
  console.log('최종 계산 결과:', {
    calculatedHourlyWage,
    overtimePay,
    nightPay,
    totalMonthlyWage,
    wageBreakdown: {
      basicWage: wageBreakdown.basicWage,
      weeklyHolidayPay: wageBreakdown.weeklyHolidayPay
    }
  });
  
  // [4] 임금 정보를 sessionStorage에 저장 (기존 호환성)
  saveWageInfoToSession(form, wageBreakdown);
  
  // [5] 월급제 계산 결과를 세션에 저장 (새로운 통합 시스템)
  saveMonthlyWageCalculationToSession(form, wageBreakdown, allowances, totalMonthlyWage, calculatedHourlyWage);

  // [2] 디자인: 요약 박스가 가장 위, 그 아래 법적 요건/차액/안내문구 (시급제와 통일)
  return (
    <div className={`monthly-wage-guide ${isCompliant ? 'compliant' : 'non-compliant'}`} style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 8,
      border: `2px solid ${isCompliant ? '#16a34a' : '#dc2626'}`,
      backgroundColor: isCompliant ? '#f0fdf4' : '#fef2f2'
    }}>
      {/* 월 예상 임금 요약 박스 (최상단) */}
      <div style={{
        background: '#e0fdf4',
        border: '2px solid #10b981',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(16,185,129,0.10)',
        padding: 28,
        margin: '0 0 24px 0',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 18,
          right: 24,
          fontSize: 22,
          color: '#10b981',
          fontWeight: 900
        }}>💰</div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#047857',
          marginBottom: 18,
          letterSpacing: '-0.5px'
        }}>
          ■ 월 예상 임금 요약
        </div>
        <div style={{
          background: '#d1fae5',
          borderRadius: 10,
          padding: '18px 0 10px 0',
          marginBottom: 18,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(16,185,129,0.07)'
        }}>
          <div style={{
            fontSize: 17,
            color: '#047857',
            fontWeight: 600,
            marginBottom: 4
          }}>총 임금 (예상)</div>
          <div style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#059669',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // 세션에 저장된 값들을 사용하여 툴팁 데이터 생성
            const monthlySalaryInfo = JSON.parse(sessionStorage.getItem('monthlySalaryInfo') || '{}');
            const workTimeInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
            
            // 세션값이 없으면 현재 계산값 사용
            const sessionBasicWage = monthlySalaryInfo.basicWage || Math.ceil(wageBreakdown.basicWage);
            const sessionWeeklyHolidayPay = monthlySalaryInfo.weeklyHolidayPay || Math.ceil(wageBreakdown.weeklyHolidayPay);
            const sessionAllowances = monthlySalaryInfo.allowances || Math.ceil(allowances);
            const sessionOvertimePay = monthlySalaryInfo.overtimePay || Math.ceil(overtimePay);
            const sessionNightPay = monthlySalaryInfo.nightPay || Math.ceil(nightPay);
            const sessionTotalWage = monthlySalaryInfo.totalExpectedMonthlyWage || Math.ceil(totalMonthlyWage);
            
            // 세션에 저장된 근무시간 정보 사용
            const sessionWeeklyWorkHours = workTimeInfo.weeklyWorkHours || weeklyWorkHours;
            const sessionMonthlyWorkHours = workTimeInfo.monthlyWorkHours || monthlyWorkHours;
            const sessionOvertimeHours = workTimeInfo.overtimeWorkHours || overtimeWorkHours;
            const sessionNightHours = workTimeInfo.nightWorkHours || nightWorkHours;
            
            // 계산된 시급 (세션값 우선, 없으면 현재 계산값)
            const sessionHourlyWage = monthlySalaryInfo.calculatedHourlyWage || calculatedHourlyWage;
            
            const formulaData = {
              title: '월급제 임금 계산 공식 (세션값 기준)',
              formula: '총 월 예상 임금 = 기본급 + 주휴수당 + 제수당 + 연장근로수당 + 야간근로수당',
              details: [
                `기본급: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 주간근로시간(${sessionWeeklyWorkHours.toFixed(1)}시간) × 4.346주 = ${formatNumberWithCommas(sessionBasicWage)}원`,
                `주휴수당: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 주휴시간(${wageBreakdown.calculationBasis.weeklyHolidayHours}시간) = ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원`,
                `기본급 + 주휴수당: ${formatNumberWithCommas(sessionBasicWage)}원 + ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원 = ${formatNumberWithCommas(Math.ceil(inputWage))}원`,
                `제수당: ${formatNumberWithCommas(sessionAllowances)}원`,
                `연장근로수당: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 0.5 × 연장시간(${sessionOvertimeHours.toFixed(1)}시간) × 4.346주 = ${formatNumberWithCommas(sessionOvertimePay)}원`,
                `야간근로수당: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 0.5 × 야간시간(${sessionNightHours.toFixed(1)}시간) × 4.346주 = ${formatNumberWithCommas(sessionNightPay)}원`,
                `총 월 예상 임금: ${formatNumberWithCommas(Math.ceil(inputWage))}원 + ${formatNumberWithCommas(sessionAllowances)}원 + ${formatNumberWithCommas(sessionOvertimePay)}원 + ${formatNumberWithCommas(sessionNightPay)}원 = ${formatNumberWithCommas(sessionTotalWage)}원`
              ],
              result: `${formatNumberWithCommas(sessionTotalWage)}원`,
              note: '입력한 월급(주휴수당 포함) + 제수당 + 연장/야간근로수당 (모든 계산은 세션에 저장된 값 기준)'
            };
            showTooltip(e, 'wageFormula', calculateMouseTooltipPosition);
            setFormulaData(formulaData);
          }}
          onMouseEnter={(e) => e.target.style.color = '#047857'}
          onMouseLeave={(e) => e.target.style.color = '#059669'}
          >
            <span className="session-value" style={{fontSize: '30px'}}>{formatNumberWithCommas(Math.ceil(totalMonthlyWage))}원</span>
          </div>
          <div style={{
            fontSize: 13,
            color: '#047857',
            marginTop: 2
          }}>
            ※ 입력한 월급(주휴수당 포함) + 제수당 + 연장/야간근로수당
          </div>
        </div>
        <table style={{
          width: '100%',
          fontSize: 16,
          color: '#065f46',
          marginBottom: 10
        }}>
          <tbody>
            <tr>
              <td style={{padding: '4px 0'}}>기본급</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(wageBreakdown.basicWage))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>주휴수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(wageBreakdown.weeklyHolidayPay))}원</span></td>
            </tr>
            <tr style={{borderTop: '1px solid #e5e7eb'}}>
              <td style={{padding: '4px 0', fontWeight: 'bold'}}>기본급+주휴수당</td>
              <td style={{textAlign: 'right', fontWeight: 'bold'}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(inputWage))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>제수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(allowances))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>연장근로수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(overtimePay))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>야간근로수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value" style={{fontSize: '18px'}}>{formatNumberWithCommas(Math.ceil(nightPay))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0', borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 'bold'}}>총 월 예상 임금</td>
              <td style={{textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: 8}}><span className="session-value" style={{fontSize: '22px'}}>{formatNumberWithCommas(Math.ceil(totalMonthlyWage))}원</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 법적 요건/차액/안내문구 */}
      {!isCompliant && (
        <h4 className="wage-guide-title" style={{
          margin: '0 0 12px 0',
          color: '#dc2626',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ⚠️ 법적 요건 미충족
        </h4>
      )}
      <div className="wage-guide-content">
        {!isCompliant && (
          <div className="wage-comparison" style={{marginBottom: 16}}>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>입력된 월급:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(inputWage))}원</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>제수당:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(allowances))}원</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>법적 최소 임금:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(minimumWage.totalMinimumWage))}원</span></span>
            </div>
            <div className="wage-difference" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              borderRadius: 6,
              border: '1px solid #dc2626'
            }}>
              <span className="difference-label" style={{fontWeight: 'bold'}}>차액:</span>
              <span className="difference-value negative" style={{
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                -{formatNumberWithCommas(Math.ceil(Math.abs(totalMonthlyWage - minimumWage.totalMinimumWage)))}원
              </span>
            </div>
          </div>
        )}
        <div className="wage-info" style={{
          padding: 12,
          backgroundColor: '#eff6ff',
          borderRadius: 6,
          border: '1px solid #3b82f6',
          marginTop: 8
        }}>
          <h5 className="info-title" style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151'
          }}>■ 월급제 안내</h5>
          <p className="info-text" style={{
            margin: 0,
            fontSize: '13px',
            color: '#374151'
          }}>
            위의 월 예상 임금은 입력한 월급(주휴수당 포함)과 제수당을 모두 합산한 금액입니다. 실제 지급액은 근무일수, 제수당 실적 등에 따라 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// 시급제 법적 기준 안내 컴포넌트
function HourlyWageLegalGuide({ form, showTooltip, setFormulaData }) {
  if (form.salaryType !== 'hourly' || !form.hourlyWage) {
    return null;
  }
  const allowances = parseNumberFromCommas(form.allowances) || 0;
  const workStats = calcWorkStats(form);
  const monthlyWorkHours = workStats.totalMonth / 60; // 분을 시간으로 변환
  const weeklyWorkHours = workStats.totalWeek / 60; // 분을 시간으로 변환
  const inputHourlyWage = parseNumberFromCommas(form.hourlyWage) || 0;
  const isCompliant = inputHourlyWage >= LEGAL_INFO.MIN_WAGE;
  const difference = inputHourlyWage - LEGAL_INFO.MIN_WAGE;
  // 월 예상 임금 계산 (기본급과 주휴수당 분리)
  const wageBreakdown = separateHourlyWage(inputHourlyWage, monthlyWorkHours, weeklyWorkHours);
  const overtimePay = Math.round((workStats.over / 60) * inputHourlyWage * 0.5);
  const nightPay = Math.round((workStats.night / 60) * inputHourlyWage * 0.5);
  const totalMonthlyWage = wageBreakdown.totalWage + overtimePay + nightPay + allowances;
  
  // 임금 정보를 sessionStorage에 저장 (연장수당, 야간수당 포함)
  saveWageInfoToSession(form, wageBreakdown, {
    overtimePay,
    nightPay,
    totalMonthlyWage
  });
  // 월급제와 동일한 구조/스타일 적용
  return (
    <div className={`hourly-wage-guide ${isCompliant ? 'compliant' : 'non-compliant'}`} style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 8,
      border: `2px solid ${isCompliant ? '#16a34a' : '#dc2626'}`,
      backgroundColor: isCompliant ? '#f0fdf4' : '#fef2f2'
    }}>
      {/* 월 예상 임금 요약 박스 (최상단) */}
      <div style={{
        background: '#e0fdf4',
        border: '2px solid #10b981',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(16,185,129,0.10)',
        padding: 28,
        margin: '0 0 24px 0',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 18,
          right: 24,
          fontSize: 22,
          color: '#10b981',
          fontWeight: 900
        }}>💰</div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#047857',
          marginBottom: 18,
          letterSpacing: '-0.5px'
        }}>
          ■ 월 예상 임금 요약
        </div>
        <div style={{
          background: '#d1fae5',
          borderRadius: 10,
          padding: '18px 0 10px 0',
          marginBottom: 18,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(16,185,129,0.07)'
        }}>
          <div style={{
            fontSize: 17,
            color: '#047857',
            fontWeight: 600,
            marginBottom: 4
          }}>총 임금 (예상)</div>
          <div style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#059669',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // 세션에 저장된 값들을 사용하여 툴팁 데이터 생성
            const wageInfo = JSON.parse(sessionStorage.getItem('wageInfo') || '{}');
            const workTimeInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
            
            // 세션값이 없으면 현재 계산값 사용
            const sessionBasicWage = wageInfo.wageBreakdown?.basicWage || Math.ceil(wageBreakdown.basicWage);
            const sessionWeeklyHolidayPay = wageInfo.wageBreakdown?.weeklyHolidayPay || Math.ceil(wageBreakdown.weeklyHolidayPay);
            const sessionTotalWage = wageInfo.wageBreakdown?.totalWage || Math.ceil(wageBreakdown.totalWage);
            const sessionAllowances = wageInfo.allowances || Math.ceil(allowances);
            const sessionOvertimePay = wageInfo.overtimePay || Math.ceil(overtimePay);
            const sessionNightPay = wageInfo.nightPay || Math.ceil(nightPay);
            const sessionTotalMonthlyWage = wageInfo.totalMonthlyWage || Math.ceil(totalMonthlyWage);
            
            // 세션에 저장된 근무시간 정보 사용
            const sessionMonthlyWorkHours = workTimeInfo.monthlyWorkHours || monthlyWorkHours;
            const sessionWeeklyWorkHours = workTimeInfo.weeklyWorkHours || weeklyWorkHours;
            const sessionOvertimeHours = workTimeInfo.overtimeWorkHours || (workStats.over / 60);
            const sessionNightHours = workTimeInfo.nightWorkHours || (workStats.night / 60);
            
            const formulaData = {
              title: '시급제 임금 계산 공식 (세션값 기준)',
              formula: '총 월 예상 임금 = 기본급 + 주휴수당 + 제수당 + 연장근로수당 + 야간근로수당',
              details: [
                `기본급: 시급(${formatNumberWithCommas(Math.ceil(inputHourlyWage))}원) × 월 근무시간(${sessionMonthlyWorkHours.toFixed(1)}시간) = ${formatNumberWithCommas(sessionBasicWage)}원`,
                `주휴수당: 시급(${formatNumberWithCommas(Math.ceil(inputHourlyWage))}원) × 주휴시간(${wageBreakdown.calculationBasis.weeklyHolidayHours}시간) = ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원`,
                `기본급 + 주휴수당: ${formatNumberWithCommas(sessionBasicWage)}원 + ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원 = ${formatNumberWithCommas(sessionTotalWage)}원`,
                `제수당: ${formatNumberWithCommas(sessionAllowances)}원`,
                `연장근로수당: 시급(${formatNumberWithCommas(Math.ceil(inputHourlyWage))}원) × 0.5 × 연장시간(${sessionOvertimeHours.toFixed(1)}시간) = ${formatNumberWithCommas(sessionOvertimePay)}원`,
                `야간근로수당: 시급(${formatNumberWithCommas(Math.ceil(inputHourlyWage))}원) × 0.5 × 야간시간(${sessionNightHours.toFixed(1)}시간) = ${formatNumberWithCommas(sessionNightPay)}원`,
                `총 월 예상 임금: ${formatNumberWithCommas(sessionTotalWage)}원 + ${formatNumberWithCommas(sessionAllowances)}원 + ${formatNumberWithCommas(sessionOvertimePay)}원 + ${formatNumberWithCommas(sessionNightPay)}원 = ${formatNumberWithCommas(sessionTotalMonthlyWage)}원`
              ],
              result: `${formatNumberWithCommas(sessionTotalMonthlyWage)}원`,
              note: '시급 × 월 근무시간 + 제수당 + 연장/야간근로수당 (모든 계산은 세션에 저장된 값 기준)'
            };
            showTooltip(e, 'wageFormula', calculateMouseTooltipPosition);
            setFormulaData(formulaData);
          }}
          onMouseEnter={(e) => e.target.style.color = '#047857'}
          onMouseLeave={(e) => e.target.style.color = '#059669'}
          >
            <span className="session-value">{formatNumberWithCommas(Math.ceil(totalMonthlyWage))}원</span>
          </div>
          <div style={{
            fontSize: 13,
            color: '#047857',
            marginTop: 2
          }}>
            ※ 시급 × 월 근무시간 + 제수당 + 연장/야간근로수당
          </div>
        </div>
        <table style={{
          width: '100%',
          fontSize: 15,
          color: '#065f46',
          marginBottom: 10
        }}>
          <tbody>
            <tr>
              <td style={{padding: '4px 0'}}>기본급</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(wageBreakdown.basicWage))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>주휴수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(wageBreakdown.weeklyHolidayPay))}원</span></td>
            </tr>
            <tr style={{borderTop: '1px solid #e5e7eb'}}>
              <td style={{padding: '4px 0', fontWeight: 'bold'}}>기본급+주휴수당</td>
              <td style={{textAlign: 'right', fontWeight: 'bold'}}><span className="session-value">{formatNumberWithCommas(Math.ceil(wageBreakdown.totalWage))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>제수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(allowances))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>연장근로수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(overtimePay))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>야간근로수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(nightPay))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0', borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 'bold'}}>총 월 예상 임금</td>
              <td style={{textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: 8}}><span className="session-value">{formatNumberWithCommas(Math.ceil(totalMonthlyWage))}원</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 법적 요건/차액/안내문구 */}
      {!isCompliant && (
        <h4 className="wage-guide-title" style={{
          margin: '0 0 12px 0',
          color: '#dc2626',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ⚠️ 법적 요건 미충족
        </h4>
      )}
      <div className="wage-guide-content">
        {!isCompliant && (
          <div className="wage-comparison" style={{marginBottom: 16}}>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>입력된 시급:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(inputHourlyWage))}원</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>제수당:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(allowances))}원</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>법적 최저 시급:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(LEGAL_INFO.MIN_WAGE))}원</span></span>
            </div>
            <div className="wage-difference" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              borderRadius: 6,
              border: '1px solid #dc2626'
            }}>
              <span className="difference-label" style={{fontWeight: 'bold'}}>차액:</span>
              <span className="difference-value negative" style={{
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                -{formatNumberWithCommas(Math.ceil(Math.abs(difference)))}원
              </span>
            </div>
          </div>
        )}
        <div className="wage-info" style={{
          padding: 12,
          backgroundColor: '#eff6ff',
          borderRadius: 6,
          border: '1px solid #3b82f6',
          marginTop: 8
        }}>
          <h5 className="info-title" style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151'
          }}>■ 시급제 안내</h5>
          <p className="info-text" style={{
            margin: 0,
            fontSize: '13px',
            color: '#374151'
          }}>
            위의 월 예상 임금은 시급 × 월 근무시간과 제수당을 모두 합산한 금액입니다. 실제 지급액은 근무일수, 제수당 실적 등에 따라 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

// 주급제 법적 기준 안내 컴포넌트
function WeeklyWageLegalGuide({ form, showTooltip, setFormulaData }) {
  if (form.salaryType !== 'weekly' || !form.weeklySalary) {
    return null;
  }
  
  const workStats = calcWorkStats(form);
  const weeklyWorkHours = workStats.totalWeek / 60;
  const inputWeeklySalary = parseNumberFromCommas(form.weeklySalary) || 0;
  const allowances = parseNumberFromCommas(form.allowances) || 0;
  
  // 최저 주급 계산 (주급 기준)
  const minWeeklyWage = calculateMinimumWeeklyWage({ weeklyWorkHours });
  const isCompliant = inputWeeklySalary >= minWeeklyWage.totalMinimumWage;
  const difference = inputWeeklySalary - minWeeklyWage.totalMinimumWage;
  
  // 주 예상 임금 계산 (주급 + 제수당)
  const totalWeeklyWage = inputWeeklySalary + allowances;
  
  // 기본급과 주휴수당 분리 계산
  const wageBreakdown = separateWeeklyWage(inputWeeklySalary);
  
  // 임금 정보를 sessionStorage에 저장
  saveWageInfoToSession(form, wageBreakdown);
  
  return (
    <div className={`weekly-wage-guide ${isCompliant ? 'compliant' : 'non-compliant'}`} style={{
      marginTop: 16,
      padding: 16,
      borderRadius: 8,
      border: `2px solid ${isCompliant ? '#16a34a' : '#dc2626'}`,
      backgroundColor: isCompliant ? '#f0fdf4' : '#fef2f2'
    }}>
      {/* 월 예상 임금 요약 박스 (최상단) */}
      <div style={{
        background: '#e0fdf4',
        border: '2px solid #10b981',
        borderRadius: 14,
        boxShadow: '0 4px 16px rgba(16,185,129,0.10)',
        padding: 28,
        margin: '0 0 24px 0',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 18,
          right: 24,
          fontSize: 22,
          color: '#10b981',
          fontWeight: 900
        }}>💰</div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#047857',
          marginBottom: 18,
          letterSpacing: '-0.5px'
        }}>
          ■ 주 예상 임금 요약
        </div>
        <div style={{
          background: '#d1fae5',
          borderRadius: 10,
          padding: '18px 0 10px 0',
          marginBottom: 18,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(16,185,129,0.07)'
        }}>
          <div style={{
            fontSize: 17,
            color: '#047857',
            fontWeight: 600,
            marginBottom: 4
          }}>주 총 임금 (예상)</div>
          <div style={{
            fontSize: 32,
            fontWeight: 900,
            color: '#059669',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            cursor: 'pointer'
          }}
          onClick={(e) => {
            // 세션에 저장된 값들을 사용하여 툴팁 데이터 생성
            const wageInfo = JSON.parse(sessionStorage.getItem('wageInfo') || '{}');
            const workTimeInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
            
            // 세션값이 없으면 현재 계산값 사용
            const sessionBasicWage = wageInfo.wageBreakdown?.basicWage || Math.ceil(wageBreakdown.basicWage);
            const sessionWeeklyHolidayPay = wageInfo.wageBreakdown?.weeklyHolidayPay || Math.ceil(wageBreakdown.weeklyHolidayPay);
            const sessionTotalWage = wageInfo.wageBreakdown?.totalWage || Math.ceil(wageBreakdown.totalWage);
            const sessionAllowances = wageInfo.allowances || Math.ceil(allowances);
            
            // 세션에 저장된 근무시간 정보 사용
            const sessionWeeklyWorkHours = workTimeInfo.weeklyWorkHours || weeklyWorkHours;
            
            // 주급에서 시급 계산 (세션값 우선)
            const sessionHourlyWage = wageInfo.calculationBasis?.hourlyWage || (inputWeeklySalary / weeklyWorkHours);
            
            const formulaData = {
              title: '주급제 임금 계산 공식 (세션값 기준)',
              formula: '주 총 예상 임금 = 기본급 + 주휴수당 + 제수당',
              details: [
                `기본급: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 주간근로시간(${sessionWeeklyWorkHours.toFixed(1)}시간) = ${formatNumberWithCommas(sessionBasicWage)}원`,
                `주휴수당: 시급(${formatNumberWithCommas(Math.ceil(sessionHourlyWage))}원) × 주휴시간(${wageBreakdown.calculationBasis.weeklyHolidayHours}시간) = ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원`,
                `기본급 + 주휴수당: ${formatNumberWithCommas(sessionBasicWage)}원 + ${formatNumberWithCommas(sessionWeeklyHolidayPay)}원 = ${formatNumberWithCommas(sessionTotalWage)}원`,
                `제수당: ${formatNumberWithCommas(sessionAllowances)}원`,
                `총 주 예상 임금: ${formatNumberWithCommas(sessionTotalWage)}원 + ${formatNumberWithCommas(sessionAllowances)}원 = ${formatNumberWithCommas(inputWeeklySalary + allowances)}원`
              ],
              result: `${formatNumberWithCommas(inputWeeklySalary + allowances)}원`,
              note: '주급(주휴수당 포함) + 제수당 (모든 계산은 세션에 저장된 값 기준)'
            };
            showTooltip(e, 'wageFormula', calculateMouseTooltipPosition);
            setFormulaData(formulaData);
          }}
          onMouseEnter={(e) => e.target.style.color = '#047857'}
          onMouseLeave={(e) => e.target.style.color = '#059669'}
          >
            <span className="session-value">{formatNumberWithCommas(Math.ceil(inputWeeklySalary + allowances))}원</span>
          </div>
          <div style={{
            fontSize: 13,
            color: '#047857',
            marginTop: 2
          }}>
            ※ 주급(주휴수당 포함) + 제수당
          </div>
        </div>
        <table style={{
          width: '100%',
          fontSize: 15,
          color: '#065f46',
          marginBottom: 10
        }}>
          <tbody>
            <tr>
              <td style={{padding: '4px 0'}}>기본급</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(wageBreakdown.basicWage))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>주휴수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(wageBreakdown.weeklyHolidayPay))}원</span></td>
            </tr>
            <tr style={{borderTop: '1px solid #e5e7eb'}}>
              <td style={{padding: '4px 0', fontWeight: 'bold'}}>주급 (주휴수당 포함)</td>
              <td style={{textAlign: 'right', fontWeight: 'bold'}}><span className="session-value">{formatNumberWithCommas(Math.ceil(inputWeeklySalary))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0'}}>제수당</td>
              <td style={{textAlign: 'right', fontWeight: 600}}><span className="session-value">{formatNumberWithCommas(Math.ceil(allowances))}원</span></td>
            </tr>
            <tr>
              <td style={{padding: '4px 0', borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 'bold'}}>총 주 예상 임금</td>
              <td style={{textAlign: 'right', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', paddingTop: 8}}><span className="session-value">{formatNumberWithCommas(Math.ceil(inputWeeklySalary + allowances))}원</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* 법적 요건/차액/안내문구 */}
      {!isCompliant && (
        <h4 className="wage-guide-title" style={{
          margin: '0 0 12px 0',
          color: '#dc2626',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ⚠️ 법적 요건 미충족
        </h4>
      )}
      <div className="wage-guide-content">
        {!isCompliant && (
          <div className="wage-comparison" style={{marginBottom: 16}}>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>입력된 주급:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(inputWeeklySalary))}원</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>주간 근무시간:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(weeklyWorkHours))}시간</span></span>
            </div>
            <div className="wage-item" style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <span className="wage-label" style={{fontWeight: 'bold'}}>최저 주급:</span>
              <span className="wage-value"><span className="session-value">{formatNumberWithCommas(Math.ceil(minWeeklyWage.totalMinimumWage))}원</span></span>
            </div>
            <div className="wage-difference" style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 12px',
              backgroundColor: '#fee2e2',
              borderRadius: 6,
              border: '1px solid #dc2626'
            }}>
              <span className="difference-label" style={{fontWeight: 'bold'}}>차액:</span>
              <span className="difference-value negative" style={{
                fontWeight: 'bold',
                color: '#dc2626'
              }}>
                -{formatNumberWithCommas(Math.ceil(Math.abs(difference)))}원
              </span>
            </div>
          </div>
        )}
        <div className="wage-info" style={{
          padding: 12,
          backgroundColor: '#eff6ff',
          borderRadius: 6,
          border: '1px solid #3b82f6',
          marginTop: 8
        }}>
          <h5 className="info-title" style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151'
          }}>■ 주급제 안내</h5>
          <p className="info-text" style={{
            margin: 0,
            fontSize: '13px',
            color: '#374151'
          }}>
            위의 주 예상 임금은 입력한 주급(주휴수당 포함)과 제수당을 모두 합산한 금액입니다. 실제 지급액은 근무일수, 제수당 실적 등에 따라 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export { MonthlyWageLegalGuide, HourlyWageLegalGuide, WeeklyWageLegalGuide }; 