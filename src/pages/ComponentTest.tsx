import React, { useState } from 'react';
import { Button, Input, Card, Modal, Icon } from '../components/ui';

const ComponentTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          UI 컴포넌트 테스트
        </h1>

        {/* Button 컴포넌트 테스트 */}
        <Card title="Button 컴포넌트" className="mb-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small Button</Button>
              <Button size="md">Medium Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button icon={<Icon name="Plus" size={16} />}>With Icon</Button>
              <Button loading>Loading Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>
          </div>
        </Card>

        {/* Input 컴포넌트 테스트 */}
        <Card title="Input 컴포넌트" className="mb-8">
          <div className="space-y-4">
            <Input
              label="기본 입력"
              placeholder="텍스트를 입력하세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="아이콘이 있는 입력"
              placeholder="검색어를 입력하세요"
              icon={<Icon name="Search" size={16} />}
            />
            <Input
              label="에러가 있는 입력"
              placeholder="에러 예시"
              error="이 필드는 필수입니다"
            />
            <Input
              label="도움말이 있는 입력"
              placeholder="이메일을 입력하세요"
              helpText="올바른 이메일 형식을 입력해주세요"
              type="email"
            />
          </div>
        </Card>

        {/* Card 컴포넌트 테스트 */}
        <Card title="Card 컴포넌트" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card
              title="기본 카드"
              subtitle="카드 부제목"
              hoverable
              onClick={() => alert('카드 클릭!')}
            >
              <p className="text-gray-600">이것은 기본 카드입니다.</p>
            </Card>
            
            <Card
              title="액션이 있는 카드"
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">취소</Button>
                  <Button size="sm">확인</Button>
                </div>
              }
            >
              <p className="text-gray-600">액션 버튼이 있는 카드입니다.</p>
            </Card>
            
            <Card
              title="다양한 패딩"
              padding="lg"
              shadow="lg"
            >
              <p className="text-gray-600">큰 패딩과 그림자가 있는 카드입니다.</p>
            </Card>
          </div>
        </Card>

        {/* Modal 컴포넌트 테스트 */}
        <Card title="Modal 컴포넌트" className="mb-8">
          <div className="flex gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              모달 열기
            </Button>
          </div>
        </Card>

        {/* Icon 컴포넌트 테스트 */}
        <Card title="Icon 컴포넌트" className="mb-8">
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {(['Search', 'Plus', 'Edit', 'Trash2', 'Camera', 'Image', 'FileText', 'Save', 'X', 'Home'] as const).map((iconName) => (
              <div key={iconName} className="flex flex-col items-center p-2 border rounded">
                <Icon name={iconName} size={24} />
                <span className="text-xs mt-1 text-gray-600">{iconName}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title="테스트 모달"
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              확인
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          이것은 테스트용 모달입니다. 모달의 내용을 확인할 수 있습니다.
        </p>
      </Modal>
    </div>
  );
};

export default ComponentTest; 