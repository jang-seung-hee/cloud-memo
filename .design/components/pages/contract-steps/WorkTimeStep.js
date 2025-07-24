import React, { useEffect, useCallback } from 'react';
import { 
  timeStrToMinutes, 
  getPracticalBreakMinutes,
  getBtnTime
} from '../../../utils/laborRules';
import { saveStepDataToSession, debouncedSaveStepData } from '../../../utils/stepSession';
import WorkTimeSummary from '../common/WorkTimeSummary';
import OvertimeWarning from '../common/OvertimeWarning';

function WorkTimeStep({ 
  form, 
  handleChange, 
  setForm, 
  stepErrors, 
  tooltip, 
  showTooltip, 
  hideTooltip, 
  toggleTooltip, 
  setFormulaData 
}) {
  const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

  // 렌더링 시 기본값이 있을 때 세션 저장
  useEffect(() => {
    if (form && (form.workTimeType || form.days?.length > 0 || form.commonStart || form.commonEnd || form.commonBreak || Object.keys(form.dayTimes || {}).length > 0)) {
      saveStepDataToSession(5, form);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 입력값이 변경될 때 세션 저장 (디바운스 적용)
  useEffect(() => {
    if (form) {
      debouncedSaveStepData(5, form, 500);
    }
  }, [form.workTimeType, form.days, form.commonStart, form.commonEnd, form.commonBreak, form.dayTimes]);

  // 매일 같은 근무시간일 때 휴게시간 자동 계산
  useEffect(() => {
    if (form.workTimeType === 'same' && form.commonStart && form.commonEnd) {
      const s = timeStrToMinutes(form.commonStart);
      const e = timeStrToMinutes(form.commonEnd);
      let workMinutes = e > s ? e - s : (e + 24 * 60) - s;
      const calculatedBreak = getPracticalBreakMinutes(workMinutes);
      
      // 휴게시간이 다를 때만 업데이트 (무한 루프 방지)
      if (form.commonBreak !== calculatedBreak) {
        console.log('휴게시간 자동 계산:', calculatedBreak);
        setForm(prevForm => ({ ...prevForm, commonBreak: calculatedBreak }));
      }
    }
  }, [form.workTimeType, form.commonStart, form.commonEnd, form.commonBreak, setForm]);

  // 요일별 근무시간일 때 휴게시간 자동 계산
  useEffect(() => {
    if (form.workTimeType === 'diff' && form.dayTimes) {
      let hasChanges = false;
      const updatedDayTimes = { ...form.dayTimes };
      
      Object.keys(updatedDayTimes).forEach(day => {
        const dayTime = updatedDayTimes[day];
        if (dayTime && dayTime.start && dayTime.end) {
          const s = timeStrToMinutes(dayTime.start);
          const e = timeStrToMinutes(dayTime.end);
          let workMinutes = e > s ? e - s : (e + 24 * 60) - s;
          const calculatedBreak = getPracticalBreakMinutes(workMinutes);
          
          if (dayTime.break !== calculatedBreak) {
            updatedDayTimes[day] = { ...dayTime, break: calculatedBreak };
            hasChanges = true;
            console.log(`${day} 휴게시간 자동 계산:`, calculatedBreak);
          }
        }
      });
      
      if (hasChanges) {
        setForm(prevForm => ({ ...prevForm, dayTimes: updatedDayTimes }));
      }
    }
  }, [form.workTimeType, form.dayTimes, setForm]);

  return (
    <div className="step-container">
      {/* 작성 가이드: 파란색 박스 */}
      <div className="guide-box" style={{background: '#e0f2fe', borderLeft: '5px solid #2563eb', borderRadius: 8, padding: 16, marginBottom: 16}}>
        <p className="guide-title" style={{fontWeight: 'bold', color: '#2563eb', marginBottom: 4}}>📋 작성 가이드</p>
        <p className="guide-text" style={{marginBottom: 8}}>근로시간은 근로기준법의 핵심 규정입니다. 법정 근로시간을 준수하고, 연장근로와 휴게시간을 정확히 설정해주세요.</p>
        {/* 법적 기준: 회색 박스 */}
        <div className="guide-tip" style={{background: '#f1f5f9', borderRadius: 6, padding: 10, color: '#0c4a6e', marginTop: 8}}>
          <p className="guide-tip-title" style={{fontWeight: 'bold', color: '#334155', marginBottom: 2}}>💡 법적 기준</p>
          <p className="guide-tip-text">• 1일 8시간, 1주 40시간이 기본 근로시간입니다<br/>• 1일 8시간 초과는 연장근로로 50% 가산 지급<br/>• 22:00~06:00 근무는 야간근로로 50% 가산 지급<br/>• 휴게시간은 근로기준법에 따라 자동 계산됩니다 (4시간 미만: 없음, 4시간 이상~8시간 미만: 30분, 8시간: 1시간, 8시간 초과: 1시간 30분, 12시간 초과: 2시간)</p>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">근무 요일</label>
        <div className="day-selector">
          {daysOfWeek.map((day) => (
            <label key={day} className={`day-option ${form.days.includes(day) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                name="days"
                value={day}
                checked={form.days.includes(day)}
                onChange={handleChange}
                className="day-checkbox"
              />
              <span className="day-text">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <div className="time-type-selector">
          <button 
            type="button" 
            onClick={() => {
              const newForm = { ...form, workTimeType: 'same', dayTimes: {} };
              setForm(newForm);
            }} 
            className={`time-type-btn ${form.workTimeType === 'same' ? 'active' : ''}`}
          >
            매일 같다
          </button>
          <button 
            type="button" 
            onClick={() => {
              const newForm = { ...form, workTimeType: 'diff', commonStart: '', commonEnd: '', commonBreak: '' };
              setForm(newForm);
            }} 
            className={`time-type-btn ${form.workTimeType === 'diff' ? 'active' : ''}`}
          >
            요일마다 다르다
          </button>
        </div>
      </div>

      {form.workTimeType === 'same' && (
        <>
          <div className="form-group">
            <label className="form-label">시업시간</label>
            <input 
              name="commonStart" 
              type="time" 
              value={form.commonStart} 
              onChange={handleChange} 
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">종업시간</label>
            <input 
              name="commonEnd" 
              type="time" 
              value={form.commonEnd} 
              onChange={handleChange} 
              className="form-input" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">휴게시간</label>
            <input 
              name="commonBreak" 
              type="number" 
              value={form.commonBreak} 
              onChange={handleChange} 
              className="form-input" 
              placeholder="분 단위로 입력" 
            />
            <p className="form-help">근로기준법에 따라 자동 계산되며, 필요시 수정 가능합니다</p>
          </div>
        </>
      )}

      {form.workTimeType === 'diff' && (
        <div className="form-group">
          <label className="form-label">요일별 근무시간</label>
          <div className="day-times">
            {(() => {
              const safeDays = Array.isArray(form.days) ? form.days : [];
              const validDays = safeDays.filter(day => day && typeof day === 'string');
              return validDays.map((day) => (
                <div key={day} className="day-time-item">
                  <div className="day-time-header">
                    <span className="day-time-day">{day}</span>
                    <span className="day-time-summary">
                      {getBtnTime(day, form) ? `(${getBtnTime(day, form)}근무)` : '(근무시간: -)'}
                    </span>
                  </div>
                  <div className="day-time-inputs">
                    <input
                      type="time"
                      name="dayStart"
                      data-day={day}
                      value={form.dayTimes[day]?.start || ''}
                      onChange={handleChange}
                      className="form-input time-input"
                      placeholder="출근"
                    />
                    <span className="time-separator">~</span>
                    <input
                      type="time"
                      name="dayEnd"
                      data-day={day}
                      value={form.dayTimes[day]?.end || ''}
                      onChange={handleChange}
                      className="form-input time-input"
                      placeholder="퇴근"
                    />
                    <div className="break-display">
                      <span className="break-label">휴게:</span>
                      <span className="break-value">
                        {form.dayTimes[day]?.start && form.dayTimes[day]?.end 
                          ? (() => {
                              const dayTime = form.dayTimes[day];
                              const s = timeStrToMinutes(dayTime.start);
                              const e = timeStrToMinutes(dayTime.end);
                              let workMinutes = e > s ? e - s : (e + 24 * 60) - s;
                              return `${dayTime.break || getPracticalBreakMinutes(workMinutes)}분`;
                            })()
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* 근무시간 요약 및 법적 상태 표시 */}
      {form.days && form.days.length > 0 && (
        <>
          <WorkTimeSummary 
            form={form} 
            tooltip={tooltip}
            showTooltip={showTooltip}
            hideTooltip={hideTooltip}
            toggleTooltip={toggleTooltip}
            setFormulaData={setFormulaData}
          />
          <OvertimeWarning form={form} />
        </>
      )}
    </div>
  );
}

export default WorkTimeStep; 