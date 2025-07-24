import React, { useState, useEffect } from 'react';
import { Modal, Button, Icon } from '../ui';
import { createTemplate, updateTemplate } from '../../services';
import type { Template } from '../../types/template';

interface TemplateFormProps {
  template?: Template | null;
  onClose: () => void;
  onSubmit: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('임시');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string; category?: string }>({});

  // 편집 모드인 경우 기존 데이터 로드
  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setCategory(template.category);
    }
  }, [template]);

  // 유효성 검사
  const validateForm = () => {
    const newErrors: { title?: string; content?: string; category?: string } = {};

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (!category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (template) {
        // 수정 모드
        await updateTemplate(template.id, {
          title: title.trim(),
          content: content.trim(),
          category: category
        });
      } else {
        // 생성 모드
        await createTemplate({
          title: title.trim(),
          content: content.trim(),
          category: category
        });
      }

      onSubmit();
    } catch (error) {
      console.error('상용구 저장 실패:', error);
      alert('상용구 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Modal
      isOpen={true}
      title={template ? '상용구 수정' : '새 상용구 등록'}
      onClose={handleCancel}
      size="lg"
    >
      <div className="space-y-4">
        {/* 제목 입력 */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-dark-text w-16 text-left">
            제목
          </label>
          <div className="flex-1">
            <input
              type="text"
              placeholder="상용구 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>
        </div>



        {/* 내용 입력 */}
        <div>
          <textarea
            placeholder="상용구 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start resize-none bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text"
            style={{ fontFamily: 'inherit' }}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 dark:text-dark-text-muted">
            {content.length}자 / 5,000자
          </div>
        </div>



        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} />
                {template ? '수정' : '저장'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateForm; 