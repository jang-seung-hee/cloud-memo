import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Modal, Icon } from '../components/ui';
import {
  createMemo,
  getMemos,
  deleteMemo,
  getMemoStats,
  saveImage,
  getImages,
  deleteImage,
  getImageStats,
  createTemplate,
  getTemplates,
  deleteTemplate,
  getTemplateStats,
  StorageError
} from '../services';

const ServiceTest: React.FC = () => {
  const [memos, setMemos] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [memoTitle, setMemoTitle] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setMemos(getMemos());
      setImages(getImages());
      setTemplates(getTemplates());
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const showModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCreateMemo = () => {
    try {
      if (!memoContent.trim()) {
        alert('내용을 입력해주세요.');
        return;
      }

      const newMemo = createMemo({
        title: memoTitle.trim() || undefined, // 제목이 없으면 undefined
        content: memoContent
      });

      setMemos(getMemos());
      setMemoTitle('');
      setMemoContent('');
      showModal(`메모 생성 성공!\nID: ${newMemo.id}\n제목: ${newMemo.title || '(내용에서 자동 생성)'}`);
    } catch (error) {
      if (error instanceof StorageError) {
        alert(`메모 생성 실패: ${error.message}`);
      } else {
        alert('메모 생성 실패');
      }
    }
  };

  const handleDeleteMemo = (id: string) => {
    try {
      if (deleteMemo(id)) {
        setMemos(getMemos());
        showModal('메모 삭제 성공!');
      } else {
        alert('메모 삭제 실패');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        alert(`메모 삭제 실패: ${error.message}`);
      } else {
        alert('메모 삭제 실패');
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    saveImage(file)
      .then((response) => {
        setImages(getImages());
        showModal(`이미지 업로드 성공!\nID: ${response.image.id}\n이름: ${response.image.name}`);
      })
      .catch((error) => {
        if (error instanceof StorageError) {
          alert(`이미지 업로드 실패: ${error.message}`);
        } else {
          alert('이미지 업로드 실패');
        }
      });
  };

  const handleDeleteImage = (id: string) => {
    try {
      if (deleteImage(id)) {
        setImages(getImages());
        showModal('이미지 삭제 성공!');
      } else {
        alert('이미지 삭제 실패');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        alert(`이미지 삭제 실패: ${error.message}`);
      } else {
        alert('이미지 삭제 실패');
      }
    }
  };

  const handleCreateTemplate = () => {
    try {
      if (!templateTitle.trim() || !templateContent.trim() || !templateCategory.trim()) {
        alert('제목, 내용, 카테고리를 입력해주세요.');
        return;
      }

      const newTemplate = createTemplate({
        title: templateTitle,
        content: templateContent,
        category: templateCategory
      });

      setTemplates(getTemplates());
      setTemplateTitle('');
      setTemplateContent('');
      setTemplateCategory('');
      showModal(`상용구 생성 성공!\nID: ${newTemplate.id}\n제목: ${newTemplate.title}`);
    } catch (error) {
      if (error instanceof StorageError) {
        alert(`상용구 생성 실패: ${error.message}`);
      } else {
        alert('상용구 생성 실패');
      }
    }
  };

  const handleDeleteTemplate = (id: string) => {
    try {
      if (deleteTemplate(id)) {
        setTemplates(getTemplates());
        showModal('상용구 삭제 성공!');
      } else {
        alert('상용구 삭제 실패');
      }
    } catch (error) {
      if (error instanceof StorageError) {
        alert(`상용구 삭제 실패: ${error.message}`);
      } else {
        alert('상용구 삭제 실패');
      }
    }
  };

  const showStats = () => {
    try {
      const memoStats = getMemoStats();
      const imageStats = getImageStats();
      const templateStats = getTemplateStats();

      const statsText = `
메모 통계:
- 총 메모: ${memoStats.totalMemos}개
- 총 문자: ${memoStats.totalCharacters}자
- 총 이미지: ${memoStats.totalImages}개
- 오늘 메모: ${memoStats.todayMemos}개

이미지 통계:
- 총 이미지: ${imageStats.totalImages}개
- 총 크기: ${(imageStats.totalSize / 1024 / 1024).toFixed(2)}MB
- 오늘 이미지: ${imageStats.todayImages}개

상용구 통계:
- 총 상용구: ${templateStats.totalTemplates}개
- 총 문자: ${templateStats.totalCharacters}자
- 총 사용: ${templateStats.totalUsage}회
- 오늘 상용구: ${templateStats.todayTemplates}개
      `;

      showModal(statsText);
    } catch (error) {
      alert('통계 조회 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          로컬스토리지 서비스 테스트
        </h1>

        {/* 통계 버튼 */}
        <div className="mb-8 text-center">
          <Button onClick={showStats} variant="primary">
            <Icon name="Info" size={16} />
            통계 보기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메모 테스트 */}
          <Card title="메모 서비스 테스트" className="mb-8">
            <div className="space-y-4">
              <Input
                label="메모 제목 (선택사항)"
                placeholder="제목을 입력하세요 (비워두면 내용에서 자동 생성)"
                value={memoTitle}
                onChange={(e) => setMemoTitle(e.target.value)}
              />
              <Input
                label="메모 내용"
                placeholder="내용을 입력하세요"
                value={memoContent}
                onChange={(e) => setMemoContent(e.target.value)}
              />
              <Button onClick={handleCreateMemo} variant="primary">
                <Icon name="Plus" size={16} />
                메모 생성
              </Button>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">메모 목록 ({memos.length}개)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {memos.map((memo) => (
                    <div key={memo.id} className="p-2 border rounded bg-gray-50">
                      <div className="font-medium">{memo.title}</div>
                      <div className="text-sm text-gray-600">{memo.content.substring(0, 50)}...</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="mt-1"
                      >
                        <Icon name="Trash2" size={12} />
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 이미지 테스트 */}
          <Card title="이미지 서비스 테스트" className="mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 업로드
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-start file:text-white hover:file:bg-primary-end"
                />
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">이미지 목록 ({images.length}개)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {images.map((image) => (
                    <div key={image.id} className="p-2 border rounded bg-gray-50">
                      <div className="font-medium">{image.name}</div>
                      <div className="text-sm text-gray-600">
                        {(image.size / 1024).toFixed(1)}KB
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteImage(image.id)}
                        className="mt-1"
                      >
                        <Icon name="Trash2" size={12} />
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 상용구 테스트 */}
          <Card title="상용구 서비스 테스트" className="mb-8">
            <div className="space-y-4">
              <Input
                label="상용구 제목"
                placeholder="제목을 입력하세요"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
              />
              <Input
                label="상용구 내용"
                placeholder="내용을 입력하세요"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
              />
              <Input
                label="카테고리"
                placeholder="카테고리를 입력하세요"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              />
              <Button onClick={handleCreateTemplate} variant="primary">
                <Icon name="Plus" size={16} />
                상용구 생성
              </Button>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">상용구 목록 ({templates.length}개)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {templates.map((template) => (
                    <div key={template.id} className="p-2 border rounded bg-gray-50">
                      <div className="font-medium">{template.title}</div>
                      <div className="text-sm text-gray-600">{template.category}</div>
                      <div className="text-sm text-gray-600">{template.content.substring(0, 50)}...</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="mt-1"
                      >
                        <Icon name="Trash2" size={12} />
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 결과 모달 */}
      <Modal
        isOpen={isModalOpen}
        title="테스트 결과"
        onClose={() => setIsModalOpen(false)}
      >
        <pre className="whitespace-pre-wrap text-sm">{modalContent}</pre>
      </Modal>
    </div>
  );
};

export default ServiceTest; 