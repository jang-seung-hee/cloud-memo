import React, { useState } from 'react';
import { Card } from '../components/ui';
import { TemplateList, TemplateSelector, TemplateSlider } from '../components/template';
import type { Template } from '../types/template';

const TemplateManagementTest: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [testContent, setTestContent] = useState('');

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setTestContent(prev => prev + '\n\n' + template.content);
  };

  const handleTemplateEdit = (template: Template) => {
    console.log('상용구 수정:', template);
  };

  const handleTemplateDelete = (templateId: string) => {
    console.log('상용구 삭제:', templateId);
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          상용구 관리 기능 테스트
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 상용구 관리 */}
          <Card title="상용구 관리" className="mb-8">
            <TemplateList
              onTemplateSelect={handleTemplateSelect}
              onTemplateEdit={handleTemplateEdit}
              onTemplateDelete={handleTemplateDelete}
            />
          </Card>

          {/* 상용구 테스트 */}
          <Card title="상용구 테스트" className="mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">상용구 삽입 테스트</h3>
                <div className="flex items-center space-x-2">
                  {/* 데스크톱 선택기 */}
                  <div className="hidden md:block">
                    <TemplateSelector onTemplateSelect={handleTemplateSelect} />
                  </div>
                  {/* 모바일 슬라이더 */}
                  <div className="md:hidden">
                    <TemplateSlider onTemplateSelect={handleTemplateSelect} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테스트 텍스트 영역
                </label>
                <textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="상용구를 삽입해보세요..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start resize-none"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {testContent.length}자
                </div>
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-2">선택된 상용구</h4>
                  <div className="text-sm text-blue-800">
                    <p><strong>제목:</strong> {selectedTemplate.title}</p>
                    <p><strong>카테고리:</strong> {selectedTemplate.category}</p>
                    <p><strong>내용:</strong> {selectedTemplate.content.substring(0, 100)}...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 테스트 정보 */}
        <Card className="mt-8">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">테스트 가이드</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">상용구 관리 기능</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 상용구 등록/수정/삭제</li>
                  <li>• 카테고리별 분류</li>
                  <li>• 검색 및 필터링</li>
                  <li>• 미리보기 기능</li>
                  <li>• 반응형 디자인</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">상용구 삽입 기능</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• 데스크톱: 모달 선택기</li>
                  <li>• 모바일: 슬라이더 스타일</li>
                  <li>• 커서 위치 삽입</li>
                  <li>• 드래그 앤 드롭 지원</li>
                  <li>• 실시간 미리보기</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* 현재 상태 */}
        <Card className="mt-8">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">현재 상태</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">선택된 상용구:</span>
                <span className="ml-2 text-gray-600">
                  {selectedTemplate ? selectedTemplate.title : '없음'}
                </span>
              </div>
              <div>
                <span className="font-medium">테스트 텍스트:</span>
                <span className="ml-2 text-gray-600">
                  {testContent.length}자
                </span>
              </div>
              <div>
                <span className="font-medium">화면 크기:</span>
                <span className="ml-2 text-gray-600">
                  {window.innerWidth >= 768 ? '데스크톱' : '모바일'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TemplateManagementTest; 