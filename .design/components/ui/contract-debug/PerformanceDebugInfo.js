import React, { useState, useEffect } from 'react';
import { 
  getCacheStats, 
  getCachePerformanceStats, 
  getSessionDataSize, 
  clearCalculationCache, 
  clearSessionData 
} from '../../../utils/laborRules';
import { runIntegrationTest, runAutomatedIntegrationTest, runFinalComprehensiveTest } from './testUtils';

// 테스트 시나리오 데이터
const TEST_SCENARIOS = {
  hourlyWage: {
    storeName: '테스트 사업장',
    owner: '테스트 대표자',
    address: '테스트 주소',
    addressDetail: '테스트 상세주소',
    storeContact: '02-1234-5678',
    name: '테스트 근로자',
    birth: '2000-01-01',
    contact: '010-1234-5678',
    workerAddress: '테스트 근로자 주소',
    workerAddressDetail: '테스트 근로자 상세주소',
    periodStart: '2024-01-01',
    periodEnd: '',
    probationPeriod: '3개월',
    probationDiscount: '10',
    workLocation: '테스트 근무장소',
    jobDesc: '테스트 업무',
    position: '사원',
    workTimeType: 'same',
    days: ['월', '화', '수', '목', '금'],
    dayTimes: {},
    commonStart: '09:00',
    commonEnd: '18:00',
    commonBreak: '60',
    salaryType: 'hourly',
    hourlyWage: '10030',
    allowances: '200000',
    payday: '매월 25일',
    paymentMethod: '계좌이체',
    socialInsurance: true,
    terminationTypes: ['mutual_agreement'],
    termination: '',
    confidentiality: true,
    contractCopies: 2
  },
  monthlyWage: {
    storeName: '테스트 사업장',
    owner: '테스트 대표자',
    address: '테스트 주소',
    addressDetail: '테스트 상세주소',
    storeContact: '02-1234-5678',
    name: '테스트 근로자',
    birth: '2000-01-01',
    contact: '010-1234-5678',
    workerAddress: '테스트 근로자 주소',
    workerAddressDetail: '테스트 근로자 상세주소',
    periodStart: '2024-01-01',
    periodEnd: '',
    probationPeriod: '3개월',
    probationDiscount: '10',
    workLocation: '테스트 근무장소',
    jobDesc: '테스트 업무',
    position: '사원',
    workTimeType: 'same',
    days: ['월', '화', '수', '목', '금'],
    dayTimes: {},
    commonStart: '09:00',
    commonEnd: '18:00',
    commonBreak: '60',
    salaryType: 'monthly',
    monthlySalary: '3000000',
    allowances: '200000',
    payday: '매월 25일',
    paymentMethod: '계좌이체',
    socialInsurance: true,
    terminationTypes: ['mutual_agreement'],
    termination: '',
    confidentiality: true,
    contractCopies: 2
  }
};

function PerformanceDebugInfo({ setForm, setStep }) {
  const [cacheStats, setCacheStats] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // 캐시 통계 및 성능 통계 업데이트
    const updateStats = () => {
      const stats = getCacheStats();
      const perfStats = getCachePerformanceStats();
      setCacheStats(stats);
      setPerformanceStats(perfStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 3000); // 3초마다 업데이트 (최적화)

    return () => clearInterval(interval);
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '8px 12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🔧 성능 정보
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 300,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: 16,
      borderRadius: 8,
      fontSize: '12px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>🔧 성능 모니터링</h4>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      {cacheStats && (
        <div style={{ marginBottom: 12 }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>📊 캐시 통계</h5>
          <div style={{ lineHeight: 1.4 }}>
            <div>총 항목: {cacheStats.totalEntries}/{cacheStats.maxSize}</div>
            <div>유효 항목: {cacheStats.validEntries}</div>
            <div>만료 항목: {cacheStats.expiredEntries}</div>
            <div>만료 시간: {cacheStats.expiryTime}초</div>
          </div>
        </div>
      )}
      
      {performanceStats && (
        <div style={{ marginBottom: 12 }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>⚡ 성능 통계</h5>
          <div style={{ lineHeight: 1.4 }}>
            <div>평균 나이: {performanceStats.avgAgeMinutes}분</div>
            <div>히트율: {performanceStats.hitRate}%</div>
            <div>메모리 효율: {performanceStats.memoryEfficiency}%</div>
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: 12 }}>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>💾 세션 저장소</h5>
        <div style={{ lineHeight: 1.4 }}>
          <div>사용량: {getSessionDataSize()}KB</div>
          <div>제한: 5MB</div>
        </div>
      </div>
      
      <div style={{ marginBottom: 12 }}>
        <h5 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>🧪 통합 테스트</h5>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            onClick={() => runFinalComprehensiveTest(setForm, setStep)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            최종 종합 검증
          </button>
          <button
            onClick={() => runAutomatedIntegrationTest(setForm, setStep)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            자동 통합 테스트
          </button>
          <button
            onClick={() => runIntegrationTest('hourlyWage', setForm, setStep)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            시급제 테스트
          </button>
          <button
            onClick={() => runIntegrationTest('monthlyWage', setForm, setStep)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            월급제 테스트
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            clearCalculationCache();
            setCacheStats(getCacheStats());
          }}
          style={{
            padding: '4px 8px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          캐시 초기화
        </button>
        <button
          onClick={() => {
            clearSessionData();
          }}
          style={{
            padding: '4px 8px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          세션 초기화
        </button>
      </div>
    </div>
  );
}

export default PerformanceDebugInfo; 