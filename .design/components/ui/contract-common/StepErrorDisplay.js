import React from 'react';

function StepErrorDisplay({ errors, step }) {
  if (!errors || !Object.keys(errors).length) return null;
  return (
    <div className="step-error-display" style={{ margin: '16px 0', color: '#dc2626', fontWeight: 600 }}>
      <div style={{ marginBottom: 4 }}>⚠️ 입력 오류</div>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default StepErrorDisplay; 