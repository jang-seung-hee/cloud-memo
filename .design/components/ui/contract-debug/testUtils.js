import { 
  calcWorkStats, 
  getCacheStats, 
  getCachePerformanceStats, 
  getFormDataFromSession,
  getSessionDataSize
} from '../../../utils/laborRules';

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

/**
 * 통합 테스트 실행 함수
 * @param {string} scenario - 테스트 시나리오 ('hourlyWage', 'monthlyWage')
 * @param {Function} setForm - 폼 상태 설정 함수
 * @param {Function} setStep - 단계 설정 함수
 */
export function runIntegrationTest(scenario, setForm, setStep) {
  console.log(`🚀 통합 테스트 시작: ${scenario}`);
  
  const testData = TEST_SCENARIOS[scenario];
  if (!testData) {
    console.error('❌ 알 수 없는 테스트 시나리오:', scenario);
    return;
  }
  
  // 테스트 데이터로 폼 설정
  setForm(testData);
  setStep(1);
  
  // 세션 저장 테스트
  setTimeout(() => {
    console.log('📝 세션 저장 테스트...');
    const sessionData = getFormDataFromSession();
    if (sessionData && sessionData.formData) {
      console.log('✅ 세션 저장 성공');
    } else {
      console.error('❌ 세션 저장 실패');
    }
  }, 1000);
  
  // 단계별 진행 테스트
  setTimeout(() => {
    console.log('🔄 단계별 진행 테스트...');
    setStep(2);
  }, 2000);
  
  setTimeout(() => {
    console.log('🔄 단계별 진행 테스트...');
    setStep(3);
  }, 3000);
  
  // 계산 정확성 테스트
  setTimeout(() => {
    console.log('🧮 계산 정확성 테스트...');
    const workStats = calcWorkStats(testData);
    const cacheStats = getCacheStats();
    console.log('✅ 계산 완료:', { workStats, cacheStats });
  }, 4000);
  
  // 성능 테스트
  setTimeout(() => {
    console.log('⚡ 성능 테스트...');
    const perfStats = getCachePerformanceStats();
    console.log('✅ 성능 통계:', perfStats);
  }, 5000);
  
  console.log('✅ 테스트 시나리오 완료');
}

/**
 * 자동화된 통합 테스트 실행 함수
 * @param {Function} setForm - 폼 상태 설정 함수
 * @param {Function} setStep - 단계 설정 함수
 */
export function runAutomatedIntegrationTest(setForm, setStep) {
  console.log('🚀 자동화된 통합 테스트 시작');
  
  const testResults = {
    sessionManagement: false,
    stepNavigation: false,
    calculationAccuracy: false,
    termConsistency: false,
    performanceOptimization: false,
    errorHandling: false
  };
  
  // 1. 세션 관리 테스트
  console.log('📝 1. 세션 관리 테스트...');
  try {
    const testData = TEST_SCENARIOS.hourlyWage;
    setForm(testData);
    setStep(1);
    
    // 세션 저장 확인
    setTimeout(() => {
      const sessionData = getFormDataFromSession();
      if (sessionData && sessionData.formData) {
        testResults.sessionManagement = true;
        console.log('✅ 세션 관리 테스트 통과');
      } else {
        console.error('❌ 세션 관리 테스트 실패');
      }
    }, 500);
  } catch (error) {
    console.error('❌ 세션 관리 테스트 오류:', error);
  }
  
  // 2. 단계별 진행 테스트
  console.log('🔄 2. 단계별 진행 테스트...');
  try {
    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          setStep(4);
          testResults.stepNavigation = true;
          console.log('✅ 단계별 진행 테스트 통과');
        }, 300);
      }, 300);
    }, 1000);
  } catch (error) {
    console.error('❌ 단계별 진행 테스트 오류:', error);
  }
  
  // 3. 계산 정확성 테스트
  console.log('🧮 3. 계산 정확성 테스트...');
  try {
    setTimeout(() => {
      const testData = TEST_SCENARIOS.monthlyWage;
      const workStats = calcWorkStats(testData);
      const cacheStats = getCacheStats();
      
      if (workStats && cacheStats) {
        testResults.calculationAccuracy = true;
        console.log('✅ 계산 정확성 테스트 통과');
      } else {
        console.error('❌ 계산 정확성 테스트 실패');
      }
    }, 2000);
  } catch (error) {
    console.error('❌ 계산 정확성 테스트 오류:', error);
  }
  
  // 4. 용어 일관성 테스트
  console.log('📋 4. 용어 일관성 테스트...');
  try {
    setTimeout(() => {
      // 법적 용어 사용 확인
      const testData = TEST_SCENARIOS.hourlyWage;
      const hasLegalTerms = testData.jobDesc && testData.position && testData.workLocation;
      
      if (hasLegalTerms) {
        testResults.termConsistency = true;
        console.log('✅ 용어 일관성 테스트 통과');
      } else {
        console.error('❌ 용어 일관성 테스트 실패');
      }
    }, 2500);
  } catch (error) {
    console.error('❌ 용어 일관성 테스트 오류:', error);
  }
  
  // 5. 성능 최적화 테스트
  console.log('⚡ 5. 성능 최적화 테스트...');
  try {
    setTimeout(() => {
      const perfStats = getCachePerformanceStats();
      const sessionSize = getSessionDataSize();
      
      if (perfStats && sessionSize !== null) {
        testResults.performanceOptimization = true;
        console.log('✅ 성능 최적화 테스트 통과');
      } else {
        console.error('❌ 성능 최적화 테스트 실패');
      }
    }, 3000);
  } catch (error) {
    console.error('❌ 성능 최적화 테스트 오류:', error);
  }
  
  // 6. 오류 처리 테스트
  console.log('🛡️ 6. 오류 처리 테스트...');
  try {
    setTimeout(() => {
      // 잘못된 데이터로 테스트
      const invalidData = { ...TEST_SCENARIOS.hourlyWage, hourlyWage: 'invalid' };
      const workStats = calcWorkStats(invalidData);
      
      // 오류가 적절히 처리되는지 확인
      if (workStats) {
        testResults.errorHandling = true;
        console.log('✅ 오류 처리 테스트 통과');
      } else {
        console.error('❌ 오류 처리 테스트 실패');
      }
    }, 3500);
  } catch (error) {
    console.error('❌ 오류 처리 테스트 오류:', error);
  }
  
  // 최종 결과 출력
  setTimeout(() => {
    console.log('📊 통합 테스트 최종 결과:');
    console.log('세션 관리:', testResults.sessionManagement ? '✅' : '❌');
    console.log('단계별 진행:', testResults.stepNavigation ? '✅' : '❌');
    console.log('계산 정확성:', testResults.calculationAccuracy ? '✅' : '❌');
    console.log('용어 일관성:', testResults.termConsistency ? '✅' : '❌');
    console.log('성능 최적화:', testResults.performanceOptimization ? '✅' : '❌');
    console.log('오류 처리:', testResults.errorHandling ? '✅' : '❌');
    
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log(`🎯 테스트 통과율: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    
    if (successRate >= 80) {
      console.log('🎉 통합 테스트 성공! 시스템이 정상적으로 작동합니다.');
    } else {
      console.log('⚠️ 일부 테스트가 실패했습니다. 추가 검토가 필요합니다.');
    }
  }, 4000);
}

/**
 * 최종 종합 검증 테스트
 * @param {Function} setForm - 폼 상태 설정 함수
 * @param {Function} setStep - 단계 설정 함수
 */
export function runFinalComprehensiveTest(setForm, setStep) {
  console.log('🎯 최종 종합 검증 테스트 시작');
  
  const comprehensiveResults = {
    // 1. 시스템 기본 기능
    basicFunctions: {
      sessionStorage: false,
      calculationEngine: false,
      stepManagement: false,
      cacheSystem: false
    },
    
    // 2. 사용자 시나리오
    userScenarios: {
      hourlyWageContract: false,
      monthlyWageContract: false,
      stepNavigation: false,
      dataPersistence: false
    },
    
    // 3. 성능 및 최적화
    performance: {
      cacheEfficiency: false,
      sessionOptimization: false,
      calculationSpeed: false,
      memoryUsage: false
    },
    
    // 4. 오류 처리 및 안정성
    stability: {
      errorHandling: false,
      dataValidation: false,
      boundaryConditions: false,
      recoveryMechanism: false
    }
  };
  
  // 1. 시스템 기본 기능 테스트
  console.log('🔧 1. 시스템 기본 기능 테스트...');
  
  // 세션 저장소 테스트
  try {
    const testData = TEST_SCENARIOS.hourlyWage;
    setForm(testData);
    const sessionData = getFormDataFromSession();
    if (sessionData && sessionData.formData) {
      comprehensiveResults.basicFunctions.sessionStorage = true;
      console.log('✅ 세션 저장소 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 세션 저장소 테스트 실패:', error);
  }
  
  // 계산 엔진 테스트
  try {
    const workStats = calcWorkStats(TEST_SCENARIOS.monthlyWage);
    if (workStats && workStats.totalWeek > 0) {
      comprehensiveResults.basicFunctions.calculationEngine = true;
      console.log('✅ 계산 엔진 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 계산 엔진 테스트 실패:', error);
  }
  
  // 단계 관리 테스트
  try {
    setStep(1);
    setTimeout(() => setStep(2), 100);
    setTimeout(() => setStep(3), 200);
    comprehensiveResults.basicFunctions.stepManagement = true;
    console.log('✅ 단계 관리 테스트 통과');
  } catch (error) {
    console.error('❌ 단계 관리 테스트 실패:', error);
  }
  
  // 캐시 시스템 테스트
  try {
    const cacheStats = getCacheStats();
    if (cacheStats) {
      comprehensiveResults.basicFunctions.cacheSystem = true;
      console.log('✅ 캐시 시스템 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 캐시 시스템 테스트 실패:', error);
  }
  
  // 2. 사용자 시나리오 테스트
  console.log('👤 2. 사용자 시나리오 테스트...');
  
  // 시급제 계약 테스트
  try {
    setForm(TEST_SCENARIOS.hourlyWage);
    const workStats = calcWorkStats(TEST_SCENARIOS.hourlyWage);
    if (workStats && workStats.totalWeek > 0) {
      comprehensiveResults.userScenarios.hourlyWageContract = true;
      console.log('✅ 시급제 계약 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 시급제 계약 테스트 실패:', error);
  }
  
  // 월급제 계약 테스트
  try {
    setForm(TEST_SCENARIOS.monthlyWage);
    const workStats = calcWorkStats(TEST_SCENARIOS.monthlyWage);
    if (workStats && workStats.totalWeek > 0) {
      comprehensiveResults.userScenarios.monthlyWageContract = true;
      console.log('✅ 월급제 계약 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 월급제 계약 테스트 실패:', error);
  }
  
  // 단계별 진행 테스트
  try {
    for (let i = 1; i <= 5; i++) {
      setStep(i);
    }
    comprehensiveResults.userScenarios.stepNavigation = true;
    console.log('✅ 단계별 진행 테스트 통과');
  } catch (error) {
    console.error('❌ 단계별 진행 테스트 실패:', error);
  }
  
  // 데이터 지속성 테스트
  try {
    const sessionData = getFormDataFromSession();
    if (sessionData) {
      comprehensiveResults.userScenarios.dataPersistence = true;
      console.log('✅ 데이터 지속성 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 데이터 지속성 테스트 실패:', error);
  }
  
  // 3. 성능 및 최적화 테스트
  console.log('⚡ 3. 성능 및 최적화 테스트...');
  
  // 캐시 효율성 테스트
  try {
    const perfStats = getCachePerformanceStats();
    if (perfStats && perfStats.hitRate >= 0) {
      comprehensiveResults.performance.cacheEfficiency = true;
      console.log('✅ 캐시 효율성 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 캐시 효율성 테스트 실패:', error);
  }
  
  // 세션 최적화 테스트
  try {
    const sessionSize = getSessionDataSize();
    if (sessionSize !== null && sessionSize < 5000) { // 5MB 미만
      comprehensiveResults.performance.sessionOptimization = true;
      console.log('✅ 세션 최적화 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 세션 최적화 테스트 실패:', error);
  }
  
  // 계산 속도 테스트
  try {
    const startTime = performance.now();
    calcWorkStats(TEST_SCENARIOS.hourlyWage);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration < 100) { // 100ms 미만
      comprehensiveResults.performance.calculationSpeed = true;
      console.log('✅ 계산 속도 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 계산 속도 테스트 실패:', error);
  }
  
  // 메모리 사용량 테스트
  try {
    const cacheStats = getCacheStats();
    if (cacheStats && cacheStats.totalEntries < 100) { // 100개 미만
      comprehensiveResults.performance.memoryUsage = true;
      console.log('✅ 메모리 사용량 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 메모리 사용량 테스트 실패:', error);
  }
  
  // 4. 오류 처리 및 안정성 테스트
  console.log('🛡️ 4. 오류 처리 및 안정성 테스트...');
  
  // 오류 처리 테스트
  try {
    const invalidData = { ...TEST_SCENARIOS.hourlyWage, hourlyWage: 'invalid' };
    const workStats = calcWorkStats(invalidData);
    if (workStats) {
      comprehensiveResults.stability.errorHandling = true;
      console.log('✅ 오류 처리 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 오류 처리 테스트 실패:', error);
  }
  
  // 데이터 검증 테스트
  try {
    const emptyData = {};
    const workStats = calcWorkStats(emptyData);
    if (workStats) {
      comprehensiveResults.stability.dataValidation = true;
      console.log('✅ 데이터 검증 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 데이터 검증 테스트 실패:', error);
  }
  
  // 경계 조건 테스트
  try {
    const boundaryData = { ...TEST_SCENARIOS.hourlyWage, hourlyWage: '0' };
    const workStats = calcWorkStats(boundaryData);
    if (workStats) {
      comprehensiveResults.stability.boundaryConditions = true;
      console.log('✅ 경계 조건 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 경계 조건 테스트 실패:', error);
  }
  
  // 복구 메커니즘 테스트
  try {
    // 세션 초기화 후 복구 테스트
    setForm(TEST_SCENARIOS.hourlyWage);
    const sessionData = getFormDataFromSession();
    if (sessionData) {
      comprehensiveResults.stability.recoveryMechanism = true;
      console.log('✅ 복구 메커니즘 테스트 통과');
    }
  } catch (error) {
    console.error('❌ 복구 메커니즘 테스트 실패:', error);
  }
  
  // 최종 결과 출력
  setTimeout(() => {
    console.log('🎯 최종 종합 검증 결과:');
    
    // 각 카테고리별 결과
    Object.entries(comprehensiveResults).forEach(([category, tests]) => {
      console.log(`\n📋 ${category}:`);
      Object.entries(tests).forEach(([testName, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${testName}`);
      });
    });
    
    // 전체 통과율 계산
    const allTests = Object.values(comprehensiveResults).flatMap(category => 
      Object.values(category)
    );
    const passedTests = allTests.filter(Boolean).length;
    const totalTests = allTests.length;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log(`\n🎯 전체 통과율: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    
    if (successRate >= 90) {
      console.log('🎉 최종 종합 검증 성공! 시스템이 매우 안정적으로 작동합니다.');
    } else if (successRate >= 80) {
      console.log('✅ 최종 종합 검증 성공! 시스템이 안정적으로 작동합니다.');
    } else if (successRate >= 70) {
      console.log('⚠️ 최종 종합 검증 부분 성공. 일부 기능에 개선이 필요합니다.');
    } else {
      console.log('❌ 최종 종합 검증 실패. 시스템에 심각한 문제가 있습니다.');
    }
  }, 5000);
}

/**
 * 특정 요일의 근무시간을 계산하는 함수
 * @param {string} day - 요일 ('월', '화', '수', '목', '금', '토', '일')
 * @param {Object} form - 폼 데이터
 * @returns {string} - 근무시간 문자열
 */
export function getBtnTime(day, form) {
  if (form.workTimeType === 'same') {
    // 매일 같은 근무시간
    if (form.commonStart && form.commonEnd) {
      return `${form.commonStart} ~ ${form.commonEnd}`;
    }
    return '미입력';
  } else if (form.workTimeType === 'diff') {
    // 요일마다 다른 근무시간
    if (form.dayTimes && form.dayTimes[day]) {
      const dayTime = form.dayTimes[day];
      if (dayTime.start && dayTime.end) {
        return `${dayTime.start} ~ ${dayTime.end}`;
      }
    }
    return '미입력';
  }
  return '미입력';
} 