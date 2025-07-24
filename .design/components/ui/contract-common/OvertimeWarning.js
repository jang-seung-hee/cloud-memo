import React from 'react';
import { checkWorkTimeCompliance } from '../../../utils/laborRules';

function OvertimeWarning({ form }) {
  const compliance = checkWorkTimeCompliance(form);
  
  if (compliance.isOver12HoursOvertime || compliance.isOver52Hours) {
    return (
      <div style={{
        marginTop: 16,
        padding: 16,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        border: '2px solid #dc2626'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#dc2626',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          ■ 근로시간 법적 한도 초과 경고
        </h4>
        <p style={{
          margin: '0 0 8px 0',
          color: '#7f1d1d',
          fontSize: '14px'
        }}>
          현재 설정된 근로시간이 법적 한도를 초과하여 다음 단계로 진행할 수 없습니다.
        </p>
        <div style={{
          marginTop: 8,
          padding: 8,
          backgroundColor: '#fee2e2',
          borderRadius: 4,
          fontSize: '13px'
        }}>
          <p style={{margin: '0 0 4px 0', fontWeight: 'bold'}}>현재 설정:</p>
          <p style={{margin: 0}}>• 주간 총 근로시간: {compliance.weeklyTotalHours}시간</p>
          <p style={{margin: 0}}>• 주간 연장근로: {compliance.weeklyOvertimeHours}시간</p>
          <p style={{margin: 0}}>• 법적 한도: 주 52시간 (기본 40시간 + 연장 12시간)</p>
          {compliance.isOver52Hours && (
            <p style={{margin: '8px 0 0 0', fontWeight: 'bold', color: '#dc2626'}}>
              ⚠️ 주 52시간을 초과하는 근로는 불법입니다.
            </p>
          )}
          {compliance.isOver12HoursOvertime && (
            <p style={{margin: '8px 0 0 0', fontWeight: 'bold', color: '#dc2626'}}>
              ⚠️ 주 12시간을 초과하는 연장근로는 불법입니다.
            </p>
          )}
          <p style={{margin: '8px 0 0 0', fontWeight: 'bold', color: '#dc2626'}}>
           💡 해결 방법: 근무시간을 조정하여 주 52시간 이하로 맞춰주세요.
          </p>
        </div>
      </div>
    );
  }
  
  return null;
}

export default OvertimeWarning; 