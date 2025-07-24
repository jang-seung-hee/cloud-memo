import React, { useState, useEffect } from 'react';

/**
 * 재사용 가능한 공식 툴팁 컴포넌트
 * @param {Object} props
 * @param {boolean} props.show - 툴팁 표시 여부
 * @param {string} props.type - 툴팁 타입 ('weekly', 'monthly' 등)
 * @param {number} props.x - 툴팁 X 좌표
 * @param {number} props.y - 툴팁 Y 좌표
 * @param {Object} props.formulaData - 공식 데이터 객체
 * @param {Function} props.onClose - 툴팁 닫기 함수
 */
function FormulaTooltip({ show, type, x, y, formulaData, onClose }) {
  // ESC 키로 툴팁 닫기
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [show, onClose]);

  if (!show || !formulaData) return null;

  return (
    <div 
      className="formula-tooltip"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translateX(-50%)',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        zIndex: 1000,
        maxWidth: '400px',
        fontSize: '13px',
        lineHeight: '1.4',
        border: '1px solid #374151',
        pointerEvents: 'auto'
      }}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          lineHeight: '1'
        }}
        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
        onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
      >
        ✕
      </button>
      
      {/* 화살표 */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '0',
        height: '0',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid #1f2937'
      }}></div>
      
      {/* 툴팁 내용 */}
      <div>
        <div style={{
          fontWeight: 'bold', 
          fontSize: '14px', 
          marginBottom: '8px', 
          color: '#60a5fa', 
          borderBottom: '1px solid #374151', 
          paddingBottom: '6px'
        }}>
          {formulaData.title}
        </div>
        
        <div style={{
          fontWeight: 'bold', 
          marginBottom: '8px', 
          color: '#fbbf24', 
          backgroundColor: '#374151', 
          padding: '6px 8px', 
          borderRadius: '4px'
        }}>
          {formulaData.formula}
        </div>
        
        <div style={{marginBottom: '8px'}}>
          {formulaData.details.map((detail, index) => {
            // 숫자 값들을 찾아서 세션값 스타일 적용
            const parts = detail.split(/(\d+(?:,\d{3})*원|\d+(?:\.\d+)?시간|\d+(?:,\d{3})*분)/g);
            return (
              <div key={index} style={{marginBottom: '4px', fontSize: '12px'}}>
                • {parts.map((part, partIndex) => {
                  if (part.match(/^\d+(?:,\d{3})*원$|^\d+(?:\.\d+)?시간$|^\d+(?:,\d{3})*분$/)) {
                    return <span key={partIndex} className="session-value">{part}</span>;
                  }
                  return part;
                })}
              </div>
            );
          })}
        </div>
        
        <div style={{
          fontWeight: 'bold', 
          color: '#10b981', 
          borderTop: '1px solid #374151', 
          paddingTop: '8px'
        }}>
          결과: <span className="session-value">{formulaData.result}</span>
        </div>
        
        {formulaData.note && (
          <div style={{
            fontSize: '11px', 
            color: '#9ca3af', 
            marginTop: '6px', 
            fontStyle: 'italic'
          }}>
            {formulaData.note}
          </div>
        )}
      </div>
    </div>
  );
}

export default FormulaTooltip; 