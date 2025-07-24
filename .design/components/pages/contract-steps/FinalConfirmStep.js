import React, { useEffect } from 'react';
import { 
  formatNumberWithCommas,
  parseNumberFromCommas,
  LEGAL_INFO,
  calcWorkStats,
  calculateWeeklyHolidayPay,
  separateMonthlyWage,
  separateWeeklyWage,
  calculateProbationStandardWage,
  getWageInfoFromSession,
  getProbationInfoFromSession
} from '../../../utils/laborRules';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';

function FinalConfirmStep({ 
  form, 
  handleChange, 
  stepErrors 
}) {
  
  // 렌더링 시 기본값이 있을 때 세션 저장 (모든 단계 데이터 종합)
  useEffect(() => {
    if (form && Object.keys(form).length > 0) {
      saveStepDataToSession(9, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(9, form, 500);
    }
  }, [form]); // form 전체가 변경될 때마다 실행

  return (
    <div className="step-container">
      {/* 안내문구 강조 */}
      <div className="guide-box" style={{background: '#fef3c7', borderLeft: '5px solid #f59e0b', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#f59e0b', marginBottom: 4}}>✅ 최종 확인</p>
        <p className="guide-text" style={{marginBottom: 8}}>입력하신 모든 정보를 다시 한 번 확인해주세요. 계약서 생성 후에는 수정이 어려우므로 꼼꼼히 점검하세요.</p>
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e'}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', marginBottom: 2}}>💡 확인 사항</p>
          <p className="guide-tip-text">• 모든 필수 항목이 입력되었는지 확인<br/>• 임금이 최저임금을 준수하는지 확인<br/>• 근로시간이 법적 기준을 준수하는지 확인<br/>• 계약서는 근로자와 사용자 각각 1부씩 보관</p>
        </div>
      </div>
      
      {/* 입력값 요약 표 */}
      <div className="summary-table-container" style={{marginBottom: 24, fontSize: '0.85rem'}}>
        <h3 style={{fontSize: '16px', fontWeight: 'bold', marginBottom: 16, color: '#1f2937'}}>📋 입력값 요약</h3>
        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          fontSize: '0.85rem'
        }}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem'}}>
            <tbody>
              {/* 사업장 정보 */}
              <tr style={{backgroundColor: '#f9fafb', fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', width: '30%', fontSize: '0.85rem'}}>사업장 정보</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>사업장명:</strong> {form.storeName || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>대표자:</strong> {form.owner || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>주소:</strong> {form.address} {form.addressDetail}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>연락처:</strong> {form.storeContact || '-'}</div>
                </td>
              </tr>
              {/* 근로자 정보 */}
              <tr style={{fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>근로자 정보</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>성명:</strong> {form.name || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>생년월일:</strong> {form.birth || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>주소:</strong> {form.workerAddress} {form.workerAddressDetail}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>연락처:</strong> {form.contact || '-'}</div>
                </td>
              </tr>
              {/* 계약 기간 */}
              <tr style={{backgroundColor: '#f9fafb', fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>계약 기간</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>시작일:</strong> {form.periodStart || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>종료일:</strong> {form.periodEnd || '무기한'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간:</strong> {form.probationPeriod || '-'}</div>
                </td>
              </tr>
              {/* 근무 조건 */}
              <tr style={{fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>근무 조건</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>근무장소:</strong> {form.workLocation || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>업무내용:</strong> {form.jobDesc || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>직책:</strong> {form.position || '-'}</div>
                </td>
              </tr>
              {/* 근로시간 */}
              <tr style={{backgroundColor: '#f9fafb', fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>근로시간</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>근무일:</strong> {form.days.join(', ')}</div>
                  {form.workTimeType === 'same' ? (
                    <>
                      <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>근무시간:</strong> {form.commonStart} ~ {form.commonEnd}</div>
                      <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>휴게시간:</strong> {form.commonBreak}분</div>
                    </>
                  ) : (
                    <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>근무시간:</strong> 요일별 상이</div>
                  )}
                </td>
              </tr>
              {/* 임금 조건 */}
              <tr style={{fontSize: '0.85rem'}}>
                <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>임금 조건</td>
                <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>임금 형태:</strong> {form.salaryType === 'monthly' ? '월급제' : form.salaryType === 'weekly' ? '주급제' : '시급제'}</div>
                  {form.salaryType === 'monthly' ? (
                    <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>총 월임금(주휴수당포함):</strong> <span className="session-value">{Number(form.monthlySalary).toLocaleString()}원</span></div>
                  ) : form.salaryType === 'weekly' ? (
                    <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>총 주급(주휴수당포함):</strong> <span className="session-value">{Number(form.weeklySalary).toLocaleString()}원</span></div>
                  ) : (
                    <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>시급:</strong> <span className="session-value">{Number(form.hourlyWage).toLocaleString()}원</span></div>
                  )}
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>제수당:</strong> <span className="session-value">{parseNumberFromCommas(form.allowances)}원</span></div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>지급일:</strong> {form.payday || '-'}</div>
                  <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>지급방법:</strong> {form.paymentMethod || '-'}</div>
                </td>
              </tr>
              {/* 수습기간 정보 */}
              {form.probationPeriod && (() => {
                // 세션에서 수습기간 정보 가져오기
                const probationInfo = getProbationInfoFromSession();
                
                if (probationInfo) {
                  return (
                    <tr style={{backgroundColor: '#fef3c7', fontSize: '0.85rem'}}>
                      <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>수습기간</td>
                      <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간:</strong> <span className="session-value">{probationInfo.probationPeriod}</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>총 임금:</strong> <span className="session-value">{probationInfo.standardWage.toLocaleString()}원</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간 총 임금:</strong> <span className="session-value">{probationInfo.probationTotalWage.toLocaleString()}원</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간 감액률:</strong> <span className="session-value">{probationInfo.probationDiscount}%</span></div>
                        {probationInfo.hasWarning && (
                          <div style={{color: '#dc2626', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '4px'}}>
                            ⚠️ 최저임금 90% 하한선 적용됨
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                } else {
                  // 세션에 정보가 없으면 기본 계산
                  const workStats = calcWorkStats(form);
                  const monthlyWorkHours = workStats.totalMonth / 60;
                  const weeklyWorkHours = workStats.totalWeek / 60;
                  const allowances = parseNumberFromCommas(form.allowances) || 0;
                  
                  // 기본급과 주휴수당 계산
                  let basicWage = 0;
                  let weeklyHolidayPay = 0;
                  
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
                  
                  const standardWage = basicWage + weeklyHolidayPay;
                  const probationStandardWage = calculateProbationStandardWage(
                    basicWage,
                    weeklyHolidayPay,
                    form.probationDiscount,
                    form.salaryType,
                    monthlyWorkHours,
                    weeklyWorkHours,
                    workStats.over / 60,
                    workStats.night / 60
                  );
                  const probationTotalWage = probationStandardWage + allowances;
                  
                  return (
                    <tr style={{backgroundColor: '#fef3c7', fontSize: '0.85rem'}}>
                      <td style={{padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>수습기간</td>
                      <td style={{padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.85rem'}}>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간:</strong> <span className="session-value">{form.probationPeriod}</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>총 임금:</strong> <span className="session-value">{standardWage.toLocaleString()}원</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간 총 임금:</strong> <span className="session-value">{probationTotalWage.toLocaleString()}원</span></div>
                        <div style={{fontSize: '0.85rem'}}><strong style={{fontSize: '0.85rem'}}>수습기간 감액률:</strong> <span className="session-value">{form.probationDiscount}%</span></div>
                      </td>
                    </tr>
                  );
                }
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinalConfirmStep; 