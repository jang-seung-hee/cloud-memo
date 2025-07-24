import React, { useEffect, useState } from 'react';
import { parseNumberFromCommas } from '../../../utils/laborRules';

function SessionSidebar({ isOpen, onClose, form, step, steps, onStepClick }) {
  const [forceUpdate, setForceUpdate] = useState(0);

  // form이나 step이 변경될 때마다 사이드바 강제 업데이트
  useEffect(() => {
    if (isOpen) {
      setForceUpdate(prev => prev + 1);
    }
  }, [form, step, isOpen]);

  // 단계별 완료 상태 확인 (form 데이터 기반으로 간단히 판단)
  const getStepCompletionStatus = (stepId) => {
    switch (stepId) {
      case 1: // 사업장 정보
        return !!(form.storeName && form.owner && form.address);
      case 2: // 근로자 정보
        return !!(form.name && form.workerAddress);
      case 3: // 계약 기간
        return !!(form.periodStart);
      case 4: // 근무 조건
        return !!(form.workLocation && form.jobDesc);
      case 5: // 근로시간
        return !!(form.days && form.days.length > 0);
      case 6: // 임금 조건
        return !!(form.salaryType);
      case 7: // 수습기간
        return true; // 선택사항이므로 항상 완료로 처리
      case 8: // 기타 사항
        return true; // 선택사항이므로 항상 완료로 처리
      default:
        return false;
    }
  };

  // 세션 값인지 확인하는 함수
  const isSessionValue = (value, stepId) => {
    if (!value || value === '미입력') return false;
    
    // 모든 세션 데이터에 파란색 스타일 적용
    // 단계별로 세션에 데이터가 저장되어 있으면 해당 값들을 세션 값으로 간주
    const workplaceInfo = JSON.parse(sessionStorage.getItem('workplaceInfo') || '{}');
    const workerInfo = JSON.parse(sessionStorage.getItem('workerInfo') || '{}');
    const contractPeriodInfo = JSON.parse(sessionStorage.getItem('contractPeriodInfo') || '{}');
    const workConditionInfo = JSON.parse(sessionStorage.getItem('workConditionInfo') || '{}');
    const workTimeInfo = JSON.parse(sessionStorage.getItem('workTimeInfo') || '{}');
    const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
    const salaryInfo = JSON.parse(sessionStorage.getItem('salaryInfo') || '{}');
    const monthlySalaryInfo = JSON.parse(sessionStorage.getItem('monthlySalaryInfo') || '{}');
    const weeklySalaryInfo = JSON.parse(sessionStorage.getItem('weeklySalaryInfo') || '{}');
    const hourlySalaryInfo = JSON.parse(sessionStorage.getItem('hourlySalaryInfo') || '{}');
    
    // 각 단계별로 세션에 데이터가 저장되어 있으면 해당 단계의 모든 값에 세션 스타일 적용
    switch (stepId) {
      case 1: // 사업장 정보
        return Object.keys(workplaceInfo).length > 0;
      case 2: // 근로자 정보
        return Object.keys(workerInfo).length > 0;
      case 3: // 계약 기간
        return Object.keys(contractPeriodInfo).length > 0;
      case 4: // 근무 조건
        return Object.keys(workConditionInfo).length > 0;
      case 5: // 근로시간
        return Object.keys(workTimeInfo).length > 0 || Object.keys(workTimeCalculationInfo).length > 0;
      case 6: // 임금 조건
        return Object.keys(salaryInfo).length > 0 || 
               Object.keys(monthlySalaryInfo).length > 0 || 
               Object.keys(weeklySalaryInfo).length > 0 || 
               Object.keys(hourlySalaryInfo).length > 0;
      default:
        return false;
    }
  };

  // 단계별 데이터 요약 생성 (실제 세션 데이터 사용)
  const getStepSummary = (stepId) => {
    // forceUpdate를 사용하여 실시간으로 세션 데이터 다시 불러오기
    const _ = forceUpdate; // forceUpdate를 사용하여 의존성 추가
    
    // 세션에서 저장된 정보들 가져오기
    const workplaceInfo = JSON.parse(sessionStorage.getItem('workplaceInfo') || '{}');
    const workerInfo = JSON.parse(sessionStorage.getItem('workerInfo') || '{}');
    const contractPeriodInfo = JSON.parse(sessionStorage.getItem('contractPeriodInfo') || '{}');
    const workConditionInfo = JSON.parse(sessionStorage.getItem('workConditionInfo') || '{}');
    const workTimeInfo = JSON.parse(sessionStorage.getItem('workTimeInfo') || '{}');
    const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
    const salaryInfo = JSON.parse(sessionStorage.getItem('salaryInfo') || '{}');
    const monthlySalaryInfo = JSON.parse(sessionStorage.getItem('monthlySalaryInfo') || '{}');
    const weeklySalaryInfo = JSON.parse(sessionStorage.getItem('weeklySalaryInfo') || '{}');
    const hourlySalaryInfo = JSON.parse(sessionStorage.getItem('hourlySalaryInfo') || '{}');
    
    switch (stepId) {
      case 1: // 사업장 정보
        return {
          title: '사업장 정보',
          items: [
            { label: '사업장명', value: workplaceInfo.storeName || form.storeName || '미입력' },
            { label: '대표자', value: workplaceInfo.owner || form.owner || '미입력' },
            { label: '주소 1', value: workplaceInfo.address || form.address || '미입력' },
            { label: '주소 2', value: workplaceInfo.addressDetail || form.addressDetail || '미입력' },
            { label: '연락처', value: workplaceInfo.storeContact || form.storeContact || '미입력' }
          ]
        };
      case 2: // 근로자 정보
        return {
          title: '근로자 정보',
          items: [
            { label: '근로자 성명', value: workerInfo.name || form.name || '미입력' },
            { label: '생년월일', value: workerInfo.birth || form.birth || '미입력' },
            { label: '연락처', value: workerInfo.contact || form.contact || '미입력' },
            { label: '주소 1', value: workerInfo.workerAddress || form.workerAddress || '미입력' },
            { label: '주소 2', value: workerInfo.workerAddressDetail || form.workerAddressDetail || '미입력' }
          ]
        };
      case 3: // 계약 기간
        return {
          title: '계약 기간',
          items: [
            { label: '시작일', value: contractPeriodInfo.periodStart || form.periodStart || '미입력' },
            { label: '종료일', value: contractPeriodInfo.periodEnd || form.periodEnd || '무기한' },
            { label: '수습기간', value: contractPeriodInfo.probationPeriod || form.probationPeriod || '미입력' }
          ]
        };
      case 4: // 근무 조건
        return {
          title: '근무 조건',
          items: [
            { label: '근무장소', value: workConditionInfo.workLocation || form.workLocation || '미입력' },
            { label: '업무내용', value: workConditionInfo.jobDesc || form.jobDesc || '미입력' },
            { label: '직책', value: workConditionInfo.position || form.position || '미입력' }
          ]
        };
      case 5: // 근로시간
        // 실시간 저장된 근무 정보 사용
        const workDays = workTimeInfo.workDays && workTimeInfo.workDays.length > 0 ? workTimeInfo.workDays.join(', ') : (form.days && form.days.length > 0 ? form.days.join(', ') : '미입력');
        
        // 근무시간 정보 생성
        let workTime = '미입력';
        let breakTime = '미입력';
        let workHourEntries = []; // 변수 선언을 여기로 이동
        
        // 세션 데이터와 폼 데이터를 모두 확인하여 최신 정보 사용
        const currentWorkTimeType = workTimeInfo.workTimeType || form.workTimeType;
        const currentDayTimes = workTimeInfo.dayTimes || form.dayTimes || {};
        const currentCommonStart = workTimeInfo.commonStart || form.commonStart;
        const currentCommonEnd = workTimeInfo.commonEnd || form.commonEnd;
        const currentCommonBreak = workTimeInfo.commonBreak || form.commonBreak;
        
        if (currentWorkTimeType === 'same') {
          // 매일 같은 경우
          workTime = currentCommonStart && currentCommonEnd ? `${currentCommonStart} ~ ${currentCommonEnd}` : '미입력';
          breakTime = currentCommonBreak ? `${currentCommonBreak}분` : '미입력';
        } else if (currentWorkTimeType === 'diff') {
          // 요일마다 다른 경우
          const dayTimeEntries = [];
          const breakTimeEntries = [];
          
          const currentWorkDays = workTimeInfo.workDays || form.days || [];
          if (currentWorkDays.length > 0 && currentDayTimes) {
            const safeDays = Array.isArray(currentWorkDays) ? currentWorkDays : [];
            safeDays.filter(day => day && typeof day === 'string').forEach(day => {
              if (currentDayTimes[day]) {
                const dayTime = currentDayTimes[day];
                if (dayTime.start && dayTime.end) {
                  // 근무시간 계산
                  const s = parseInt(dayTime.start.split(':')[0]) * 60 + parseInt(dayTime.start.split(':')[1]);
                  const e = parseInt(dayTime.end.split(':')[0]) * 60 + parseInt(dayTime.end.split(':')[1]);
                  let workMinutes = e > s ? e - s : (e + 24 * 60) - s;
                  workMinutes = Math.max(0, workMinutes - (dayTime.break || 0));
                  const workHours = (workMinutes / 60).toFixed(1);
                  
                  dayTimeEntries.push(`${day}: ${dayTime.start}~${dayTime.end}`);
                  workHourEntries.push(`${day}(${workHours}시간)`);
                  if (dayTime.break) {
                    breakTimeEntries.push(`${day}: ${dayTime.break}분`);
                  }
                }
              }
            });
          }
          
          if (dayTimeEntries.length > 0) {
            workTime = dayTimeEntries.join(', ');
            breakTime = breakTimeEntries.length > 0 ? breakTimeEntries.join(', ') : '자동계산';
          }
        }
        
        return {
          title: '근로시간',
          items: [
            { label: '근무일', value: workDays },
            { label: '근무시간', value: workTime },
            { label: '휴게시간', value: breakTime },
            ...(currentWorkTimeType === 'diff' && workHourEntries.length > 0 ? [
              { label: '요일별 근무시간', value: workHourEntries.join(', ') }
            ] : []),
            { label: '주간 근로시간', value: workTimeCalculationInfo.weeklyWorkHours ? `${workTimeCalculationInfo.weeklyWorkHours.toFixed(1)}시간` : '미입력' },
            { label: '월 소정근로시간', value: workTimeCalculationInfo.monthlyWorkHours ? `${workTimeCalculationInfo.monthlyWorkHours.toFixed(1)}시간` : '미입력' },
            { label: '주휴시간', value: workTimeCalculationInfo.weeklyHolidayHours ? `${workTimeCalculationInfo.weeklyHolidayHours.toFixed(1)}시간` : '미입력' },
            { label: '주간 야간근로수당', value: workTimeCalculationInfo.nightWorkHours !== undefined ? `${workTimeCalculationInfo.nightWorkHours.toFixed(1)}시간` : '미입력' },
            { label: '주간 연장근로수당', value: workTimeCalculationInfo.overtimeWorkHours !== undefined ? `${workTimeCalculationInfo.overtimeWorkHours.toFixed(1)}시간` : '미입력' },
            { label: '4대보험 대상', value: workTimeCalculationInfo.insuranceEligibility ? (workTimeCalculationInfo.insuranceEligibility.isEligible ? '대상' : '비대상') : '미입력' },
            { label: '주휴수당 대상', value: workTimeCalculationInfo.weeklyHolidayEligibility ? (workTimeCalculationInfo.weeklyHolidayEligibility.isEligible ? '대상' : '비대상') : '미입력' }
          ]
        };
      case 6: // 임금 조건
        const salaryType = salaryInfo.salaryType === 'monthly' ? '월급제' : 
                          salaryInfo.salaryType === 'weekly' ? '주급제' : '시급제';
        
        const baseItems = [
          { label: '임금형태', value: salaryType }
        ];
        
        // 월급제: totalExpectedMonthlyWage, 주급제: wageInfo, 시급제: totalExpectedMonthlyWage
        if (salaryInfo.salaryType === 'monthly' && monthlySalaryInfo.totalExpectedMonthlyWage != null) {
          // 월급제 정보 - 입력된 월급 값을 올바르게 표시
          const inputMonthlySalary = monthlySalaryInfo.totalMonthlySalary || 
                                    parseNumberFromCommas(form.monthlySalary) || 0;
          
          baseItems.push(
            { label: '총 월급(주휴수당포함)', value: `${Number(inputMonthlySalary).toLocaleString()}원` },
            { label: '월 총 예상임금', value: `${Number(monthlySalaryInfo.totalExpectedMonthlyWage).toLocaleString()}원` },
            { label: '기본급', value: `${Number(monthlySalaryInfo.basicWage).toLocaleString()}원` },
            { label: '주휴수당', value: `${Number(monthlySalaryInfo.weeklyHolidayPay).toLocaleString()}원` },
            { label: '기본급+주휴수당', value: `${Number(monthlySalaryInfo.basicPlusWeeklyHoliday).toLocaleString()}원` },
            { label: '제수당', value: `${Number(monthlySalaryInfo.allowances).toLocaleString()}원` },
            { label: '연장근로수당', value: `${Number(monthlySalaryInfo.overtimePay).toLocaleString()}원` },
            { label: '야간근로수당', value: `${Number(monthlySalaryInfo.nightPay).toLocaleString()}원` },
            { label: '시급', value: `${Number(monthlySalaryInfo.calculatedHourlyWage).toLocaleString()}원` }
          );
        } else if (salaryInfo.salaryType === 'weekly') {
          // 주급제 정보: wageInfo 세션 사용
          const wageInfo = JSON.parse(sessionStorage.getItem('wageInfo') || '{}');
          const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
          
          // 시급 값을 여러 경로에서 확인 (툴팁과 동일한 방식)
          const weeklyWorkHours = workTimeCalculationInfo.weeklyWorkHours || 0;
          const inputWeeklySalary = parseNumberFromCommas(form.weeklySalary) || 0;
          const hourlyWage = wageInfo.calculationBasis?.hourlyWage || 
                            (weeklyWorkHours > 0 ? inputWeeklySalary / weeklyWorkHours : 0);
          
          // 총 주 예상 임금 계산 (툴팁과 동일한 방식)
          const allowances = wageInfo.allowances || parseNumberFromCommas(form.allowances) || 0;
          const totalWeeklyWage = inputWeeklySalary + allowances;
          
          baseItems.push(
            { label: '총 주급(주휴수당포함)', value: wageInfo.wageBreakdown?.totalWage != null ? `${Number(wageInfo.wageBreakdown.totalWage).toLocaleString()}원` : '미입력' },
            { label: '기본급', value: wageInfo.wageBreakdown?.basicWage != null ? `${Number(wageInfo.wageBreakdown.basicWage).toLocaleString()}원` : '미입력' },
            { label: '주휴수당', value: wageInfo.wageBreakdown?.weeklyHolidayPay != null ? `${Number(wageInfo.wageBreakdown.weeklyHolidayPay).toLocaleString()}원` : '미입력' },
            { label: '기본급+주휴수당', value: wageInfo.wageBreakdown ? `${(Number(wageInfo.wageBreakdown.basicWage) + Number(wageInfo.wageBreakdown.weeklyHolidayPay)).toLocaleString()}원` : '미입력' },
            { label: '제수당', value: wageInfo.allowances != null ? `${Number(wageInfo.allowances).toLocaleString()}원` : '미입력' },
            { label: '연장근로수당', value: wageInfo.overtimePay != null ? `${Number(wageInfo.overtimePay).toLocaleString()}원` : '미입력' },
            { label: '야간근로수당', value: wageInfo.nightPay != null ? `${Number(wageInfo.nightPay).toLocaleString()}원` : '미입력' },
            { label: '시급', value: hourlyWage > 0 ? `${Math.ceil(hourlyWage).toLocaleString()}원` : '미입력' },
            { label: '총 주 예상 임금', value: totalWeeklyWage > 0 ? `${Math.ceil(totalWeeklyWage).toLocaleString()}원` : '미입력' }
          );
        } else if (salaryInfo.salaryType === 'hourly') {
          // 시급제 정보 - wageInfo 세션 사용 (툴팁과 동일)
          const wageInfo = JSON.parse(sessionStorage.getItem('wageInfo') || '{}');
          const workTimeCalculationInfo = JSON.parse(sessionStorage.getItem('workTimeCalculationInfo') || '{}');
          
          // 툴팁과 동일한 방식으로 세션값 확인
          const inputHourlyWage = parseNumberFromCommas(form.hourlyWage) || 0;
          const allowances = parseNumberFromCommas(form.allowances) || 0;
          
          // 세션값이 없으면 현재 계산값 사용 (툴팁과 동일한 방식)
          const sessionBasicWage = wageInfo.wageBreakdown?.basicWage || 0;
          const sessionWeeklyHolidayPay = wageInfo.wageBreakdown?.weeklyHolidayPay || 0;
          const sessionTotalWage = wageInfo.wageBreakdown?.totalWage || 0;
          const sessionAllowances = wageInfo.allowances || allowances;
          const sessionOvertimePay = wageInfo.overtimePay || 0;
          const sessionNightPay = wageInfo.nightPay || 0;
          const sessionTotalMonthlyWage = wageInfo.totalMonthlyWage || 0;
          
          baseItems.push(
            { label: '시급', value: `${inputHourlyWage.toLocaleString()}원` },
            { label: '제수당', value: `${sessionAllowances.toLocaleString()}원` },
            { label: '기본급', value: sessionBasicWage > 0 ? `${sessionBasicWage.toLocaleString()}원` : '미입력' },
            { label: '주휴수당', value: sessionWeeklyHolidayPay > 0 ? `${sessionWeeklyHolidayPay.toLocaleString()}원` : '미입력' },
            { label: '기본급+주휴수당', value: sessionTotalWage > 0 ? `${sessionTotalWage.toLocaleString()}원` : '미입력' },
            { label: '연장근로수당', value: sessionOvertimePay > 0 ? `${sessionOvertimePay.toLocaleString()}원` : '미입력' },
            { label: '야간근로수당', value: sessionNightPay > 0 ? `${sessionNightPay.toLocaleString()}원` : '미입력' },
            { label: '총 월 예상임금', value: sessionTotalMonthlyWage > 0 ? `${sessionTotalMonthlyWage.toLocaleString()}원` : '미입력' }
          );
        }
        
        return {
          title: '임금 조건',
          items: baseItems
        };
      case 7: // 수습기간
        return {
          title: '수습기간',
          items: [
            { label: '수습기간', value: form.probationPeriod || '미입력' },
            { label: '감액률', value: form.probationDiscount ? `${form.probationDiscount}%` : '미입력' }
          ]
        };
      case 8: // 기타 사항
        return {
          title: '기타 사항',
          items: [
            { label: '4대보험', value: form.socialInsurance ? '가입' : '미가입' },
            { label: '계약서 사본', value: form.contractCopies ? `${form.contractCopies}부` : '미입력' }
          ]
        };
      default:
        return { title: '미정의', items: [] };
    }
  };

  if (!isOpen) return null;
  return (
    <div className="session-sidebar">
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>진행 현황</div>
      <ol>
        {steps.map((label, idx) => {
          const stepId = idx + 1;
          const isCompleted = getStepCompletionStatus(stepId);
          const isCurrent = stepId === step;
          const summary = getStepSummary(stepId);
          
          return (
            <li key={label} className={step === idx + 1 ? 'current' : ''} onClick={() => onStepClick(idx + 1)}>
              {step === idx + 1 ? '▶ ' : ''}{label}
              {isCompleted && (
                <div className="step-summary">
                  {summary.items.map((item, itemIdx) => {
                    const isSession = isSessionValue(item.value, stepId);
                    
                    return (
                      <div key={itemIdx} className="step-item">
                        <span className="step-label">{item.label}: </span>
                        <span 
                          className={`step-value ${isSession ? 'session-value' : ''}`}
                        >
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div style={{ marginTop: 32, fontSize: 13, color: '#666' }}>
        <div>현재 단계: <b>{steps[step - 1]}</b></div>
        <div>입력 데이터: {form ? Object.keys(form).length : 0}개 필드</div>
      </div>
    </div>
  );
}

export default SessionSidebar; 