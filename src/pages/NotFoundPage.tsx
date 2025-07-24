import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '../components/ui';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end dark:from-dark-bg dark:to-dark-bg-secondary flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-gray-400 dark:text-dark-text-muted mb-6">
          <Icon name="FileText" size={64} className="mx-auto" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text mb-4">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text-muted mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        
        <p className="text-gray-600 dark:text-dark-text-muted mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')} 
            variant="primary"
            className="w-full"
          >
            <Icon name="Home" size={16} className="mr-2" />
            홈으로 이동
          </Button>
          
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="w-full"
          >
            <Icon name="ChevronLeft" size={16} className="mr-2" />
            이전 페이지로
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 