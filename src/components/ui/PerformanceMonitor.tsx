import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Icon } from './index';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  componentCount: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = false,
  showDetails = false,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    componentCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(performance.now());
  const [renderStartTime, setRenderStartTime] = useState(0);

  // FPS 계산
  const calculateFPS = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / deltaTime);
      setMetrics(prev => ({ ...prev, fps }));
      setFrameCount(0);
      setLastTime(currentTime);
    } else {
      setFrameCount(prev => prev + 1);
    }
  }, [frameCount, lastTime]);

  // 메모리 사용량 측정
  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      setMetrics(prev => ({ ...prev, memoryUsage }));
    }
  }, []);

  // 렌더링 시간 측정
  const measureRenderTime = useCallback(() => {
    const endTime = performance.now();
    const renderTime = Math.round(endTime - renderStartTime);
    setMetrics(prev => ({ ...prev, renderTime }));
  }, [renderStartTime]);

  // 컴포넌트 수 계산 (대략적)
  const countComponents = useCallback(() => {
    const componentCount = document.querySelectorAll('[data-component]').length;
    setMetrics(prev => ({ ...prev, componentCount }));
  }, []);

  // 성능 측정 루프
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      calculateFPS();
      measureMemory();
      countComponents();
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, calculateFPS, measureMemory, countComponents]);

  // 렌더링 시작 시간 설정
  useEffect(() => {
    if (enabled) {
      setRenderStartTime(performance.now());
    }
  }, [enabled]);

  // 렌더링 완료 후 시간 측정
  useEffect(() => {
    if (enabled && renderStartTime > 0) {
      requestAnimationFrame(() => {
        measureRenderTime();
      });
    }
  }, [enabled, renderStartTime, measureRenderTime]);

  // 토글 핸들러
  const handleToggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  if (!enabled) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-600';
    if (memory < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`performance-monitor ${className}`}>
      {/* 토글 버튼 */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-full p-2"
      >
        <Icon name="Settings" size={20} />
      </Button>

      {/* 성능 패널 */}
      {isVisible && (
        <Card className="fixed bottom-16 right-4 z-50 w-64 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">성능 모니터</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleToggle}
                className="p-1"
              >
                <Icon name="X" size={14} />
              </Button>
            </div>

            {/* 기본 메트릭 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">FPS:</span>
                <span className={`text-sm font-medium ${getFPSColor(metrics.fps)}`}>
                  {metrics.fps}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">메모리:</span>
                <span className={`text-sm font-medium ${getMemoryColor(metrics.memoryUsage)}`}>
                  {metrics.memoryUsage}MB
                </span>
              </div>
            </div>

            {/* 상세 정보 */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">렌더링 시간:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.renderTime}ms
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">컴포넌트 수:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {metrics.componentCount}
                  </span>
                </div>
              </div>
            )}

            {/* 성능 상태 표시 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  metrics.fps >= 55 ? 'bg-green-500' : 
                  metrics.fps >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-600">
                  {metrics.fps >= 55 ? '최적' : 
                   metrics.fps >= 45 ? '양호' : '주의 필요'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMonitor; 