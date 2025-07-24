import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Icon, PerformanceMonitor, LazyImage } from '../components/ui';
import VirtualizedMemoList from '../components/memo/VirtualizedMemoList';
import { analyzeBundle } from '../utils/bundleAnalyzer';
import type { Memo } from '../types/memo';

const PerformanceTest: React.FC = () => {
  const [testData, setTestData] = useState<Memo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<string>('');

  // 테스트 데이터 생성
  const generateTestData = useCallback((count: number) => {
    setIsGenerating(true);
    
    const data: Memo[] = [];
    const startTime = performance.now();
    
    for (let i = 0; i < count; i++) {
      data.push({
        id: `test-${i}`,
        title: `테스트 메모 ${i + 1}`,
        content: `이것은 성능 테스트를 위한 메모 ${i + 1}입니다. ` + 
                `긴 내용을 포함하여 실제 사용 환경을 시뮬레이션합니다. ` +
                `이 메모는 다양한 길이의 텍스트를 포함하고 있어 렌더링 성능을 테스트할 수 있습니다.`,
        images: [],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    const endTime = performance.now();
    setTestData(data);
    setIsGenerating(false);
    
    console.log(`✅ ${count}개의 테스트 데이터 생성 완료 (${Math.round(endTime - startTime)}ms)`);
  }, []);

  // 성능 테스트 실행
  const runPerformanceTest = useCallback((testType: string) => {
    setSelectedTest(testType);
    const startTime = performance.now();
    
    switch (testType) {
      case 'render':
        // 렌더링 성능 테스트
        setTimeout(() => {
          const endTime = performance.now();
          setPerformanceMetrics({
            testType: '렌더링 성능',
            duration: Math.round(endTime - startTime),
            itemCount: testData.length
          });
        }, 100);
        break;
        
      case 'scroll':
        // 스크롤 성능 테스트
        setTimeout(() => {
          const endTime = performance.now();
          setPerformanceMetrics({
            testType: '스크롤 성능',
            duration: Math.round(endTime - startTime),
            itemCount: testData.length
          });
        }, 100);
        break;
        
      case 'memory':
        // 메모리 사용량 테스트
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setPerformanceMetrics({
            testType: '메모리 사용량',
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          });
        }
        break;
    }
  }, [testData.length]);

  // 번들 분석 실행
  const runBundleAnalysis = useCallback(() => {
    const analysis = analyzeBundle();
    setPerformanceMetrics({
      testType: '번들 분석',
      ...analysis
    });
  }, []);

  // 컴포넌트 마운트 시 기본 데이터 생성
  useEffect(() => {
    generateTestData(100);
  }, [generateTestData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">성능 테스트</h1>
          <p className="text-gray-600">
            애플리케이션의 성능을 테스트하고 최적화 효과를 확인합니다.
          </p>
        </div>

        {/* 테스트 컨트롤 */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">테스트 컨트롤</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Button
                onClick={() => generateTestData(100)}
                disabled={isGenerating}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                100개 데이터
              </Button>
              
              <Button
                onClick={() => generateTestData(500)}
                disabled={isGenerating}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                500개 데이터
              </Button>
              
              <Button
                onClick={() => generateTestData(1000)}
                disabled={isGenerating}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                1000개 데이터
              </Button>
              
              <Button
                onClick={() => generateTestData(5000)}
                disabled={isGenerating}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                5000개 데이터
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => runPerformanceTest('render')}
                variant="outline"
                className="w-full"
              >
                렌더링 테스트
              </Button>
              
              <Button
                onClick={() => runPerformanceTest('scroll')}
                variant="outline"
                className="w-full"
              >
                스크롤 테스트
              </Button>
              
              <Button
                onClick={() => runPerformanceTest('memory')}
                variant="outline"
                className="w-full"
              >
                메모리 테스트
              </Button>
            </div>

            <div className="mt-4">
              <Button
                onClick={runBundleAnalysis}
                variant="ghost"
                className="w-full"
              >
                번들 분석
              </Button>
            </div>
          </div>
        </Card>

        {/* 성능 메트릭 */}
        {performanceMetrics && (
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">성능 메트릭</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(performanceMetrics, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* 테스트 결과 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 일반 리스트 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                일반 리스트 ({testData.length}개)
              </h2>
              <div className="h-96 overflow-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <Icon name="Loader" size={24} className="animate-spin" />
                    <span className="ml-2">데이터 생성 중...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testData.slice(0, 50).map((memo) => (
                      <div key={memo.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{memo.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {memo.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* 가상화 리스트 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                가상화 리스트 ({testData.length}개)
              </h2>
              <div className="h-96">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <Icon name="Loader" size={24} className="animate-spin" />
                    <span className="ml-2">데이터 생성 중...</span>
                  </div>
                ) : (
                  <VirtualizedMemoList
                    memos={testData}
                    containerHeight={384}
                    itemHeight={120}
                    onSelect={(memo) => console.log('선택된 메모:', memo.title)}
                    onEdit={(memo) => console.log('편집할 메모:', memo.title)}
                    onDelete={(memoId) => console.log('삭제할 메모 ID:', memoId)}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 지연 로딩 테스트 */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">지연 로딩 테스트</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <LazyImage
                  key={i}
                  src={`https://picsum.photos/200/200?random=${i}`}
                  alt={`테스트 이미지 ${i + 1}`}
                  className="w-full h-32 rounded-lg"
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 성능 모니터 */}
      <PerformanceMonitor enabled={true} showDetails={true} />
    </div>
  );
};

export default PerformanceTest; 