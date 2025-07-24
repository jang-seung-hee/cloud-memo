import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Icon, FullscreenImageViewer } from '../ui';
import { createMemo, updateMemo, getTemplates } from '../../services';
import { processImage } from '../../utils/imageUtils';
import type { Memo, MemoCategory } from '../../types/memo';
import type { Image } from '../../types/image';
import type { Template } from '../../types/template';

interface MemoFormProps {
  memo?: Memo | null;
  onClose: () => void;
  onSubmit: () => void;
}

const MemoForm: React.FC<MemoFormProps> = ({
  memo,
  onClose,
  onSubmit
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoCategory>('임시');
  const [images, setImages] = useState<Image[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ content?: string }>({});
  const [showTemplateSidebar, setShowTemplateSidebar] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isProcessingClipboard, setIsProcessingClipboard] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 모바일 환경 감지
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 이미지 클릭 핸들러
  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setIsImageViewerOpen(true);
  };

  // 이미지 뷰어 닫기
  const handleCloseImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImage(null);
  };

  // 편집 모드인 경우 기존 데이터 로드
  useEffect(() => {
    if (memo) {
      setContent(memo.content);
      setCategory(memo.category);
      setImages(memo.images || []);
    }
  }, [memo]);

  // 클립보드 이미지 처리 (PC용)
  const handleClipboardPaste = async (e: React.ClipboardEvent) => {
    // 모바일에서는 전역 이벤트 리스너가 처리하므로 PC에서만 실행
    if (isMobile) return;
    
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        try {
          setIsProcessingClipboard(true);
          setClipboardMessage('');
          const file = item.getAsFile();
          
          if (file) {
            console.log('PC 클립보드에서 이미지 감지:', file.name, file.size, file.type);
            
            const result = await processImage(file, {
              maxWidth: 1280,
              maxHeight: 720,
              quality: 0.8
            });

            const image: Image = {
              id: `img_${Date.now()}_pc_clipboard`,
              data: result.dataUrl,
              name: `pc_clipboard_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`,
              size: result.file.size,
              type: result.file.type,
              thumbnail: result.thumbnail?.dataUrl,
              uploadedAt: new Date()
            };

            setImages(prev => [...prev, image]);
            setClipboardMessage('✅ 이미지가 성공적으로 추가되었습니다!');
            console.log('PC 클립보드 이미지 추가 완료');
            
            // 3초 후 메시지 제거
            setTimeout(() => setClipboardMessage(''), 3000);
          }
        } catch (error) {
          console.error('PC 클립보드 이미지 처리 실패:', error);
          setClipboardMessage('❌ 이미지 처리에 실패했습니다.');
          setTimeout(() => setClipboardMessage(''), 3000);
        } finally {
          setIsProcessingClipboard(false);
        }
        break;
      }
    }
  };

  // 모바일 클립보드 API 지원 확인 및 처리
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // textarea가 포커스되어 있을 때만 처리
      if (document.activeElement !== textareaRef.current) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          
          try {
            setIsProcessingClipboard(true);
            setClipboardMessage('');
            const file = item.getAsFile();
            
            if (file) {
              console.log('모바일 클립보드에서 이미지 감지:', file.name, file.size, file.type);
              
              const result = await processImage(file, {
                maxWidth: 1280,
                maxHeight: 720,
                quality: 0.8
              });

              const image: Image = {
                id: `img_${Date.now()}_mobile_clipboard`,
                data: result.dataUrl,
                name: `mobile_clipboard_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`,
                size: result.file.size,
                type: result.file.type,
                thumbnail: result.thumbnail?.dataUrl,
                uploadedAt: new Date()
              };

              setImages(prev => [...prev, image]);
              setClipboardMessage('✅ 이미지가 성공적으로 추가되었습니다!');
              console.log('모바일 클립보드 이미지 추가 완료');
              
              // 3초 후 메시지 제거
              setTimeout(() => setClipboardMessage(''), 3000);
            }
          } catch (error) {
            console.error('모바일 클립보드 이미지 처리 실패:', error);
            setClipboardMessage('❌ 이미지 처리에 실패했습니다.');
            setTimeout(() => setClipboardMessage(''), 3000);
          } finally {
            setIsProcessingClipboard(false);
          }
          break;
        }
      }
    };

    // 모바일에서만 전역 paste 이벤트 리스너 추가
    if (isMobile) {
      document.addEventListener('paste', handlePaste);
      
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [isMobile]);





  // 카메라 촬영
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // 카메라 파일 선택 처리
  const handleCameraFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const file = files[0];
        const result = await processImage(file, {
          maxWidth: 1280,
          maxHeight: 720,
          quality: 0.8
        });

        const image: Image = {
          id: `img_${Date.now()}_camera`,
          data: result.dataUrl,
          name: file.name,
          size: result.file.size,
          type: result.file.type,
          thumbnail: result.thumbnail?.dataUrl,
          uploadedAt: new Date()
        };

        setImages(prev => [...prev, image]);
      } catch (error) {
        console.error('카메라 이미지 처리 실패:', error);
        alert('카메라 이미지 처리에 실패했습니다.');
      }
    }
    // 파일 입력 초기화
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  // 갤러리 선택
  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 갤러리 파일 선택 처리
  const handleGalleryFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const uploadedImages: Image[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await processImage(file, {
            maxWidth: 1280,
            maxHeight: 720,
            quality: 0.8
          });

          const image: Image = {
            id: `img_${Date.now()}_gallery_${i}`,
            data: result.dataUrl,
            name: file.name,
            size: result.file.size,
            type: result.file.type,
            thumbnail: result.thumbnail?.dataUrl,
            uploadedAt: new Date()
          };

          uploadedImages.push(image);
        }

        setImages(prev => [...prev, ...uploadedImages]);
      } catch (error) {
        console.error('갤러리 이미지 처리 실패:', error);
        alert('갤러리 이미지 처리에 실패했습니다.');
      }
    }
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 상용구 목록 로드
  const loadTemplates = () => {
    try {
      setIsLoadingTemplates(true);
      const templateList = getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('상용구 목록 로드 실패:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // 상용구 사이드바 열기
  const handleOpenTemplateSidebar = () => {
    setShowTemplateSidebar(true);
    loadTemplates();
  };

  // 상용구 사이드바 닫기
  const handleCloseTemplateSidebar = () => {
    setShowTemplateSidebar(false);
  };

  // 상용구 선택
  const handleTemplateSelect = (template: Template) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + template.content + content.substring(end);
      setContent(newContent);
      
      // 커서 위치 조정
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.content.length, start + template.content.length);
      }, 0);
    } else {
      // textarea가 없는 경우 내용 끝에 추가
      setContent(prev => prev + '\n\n' + template.content);
    }
    
    // 사이드바 닫기
    handleCloseTemplateSidebar();
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors: { content?: string } = {};

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
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

      if (memo) {
        // 수정 모드
        await updateMemo(memo.id, {
          content: content.trim(),
          category: category,
          images: images
        });
      } else {
        // 생성 모드
        await createMemo({
          content: content.trim(),
          category: category,
          images: images
        });
      }

      onSubmit();
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소
  const handleCancel = () => {
    if (content.trim() || images.length > 0) {
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
      title={memo ? '메모 수정' : '새 메모 작성'}
      onClose={handleCancel}
      size="full"
      className="sm:max-w-4xl sm:mx-auto"
    >
      {/* 숨겨진 파일 입력들 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleGalleryFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraFileSelect}
        className="hidden"
      />

      <div className="space-y-2">
        {/* 카테고리 선택 및 미디어 액션 */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {(['임시', '기억', '보관'] as MemoCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  category === cat
                    ? cat === '임시'
                      ? 'bg-orange-500 text-white'
                      : cat === '기억'
                      ? 'bg-blue-500 text-white'
                      : 'bg-red-500 text-white'
                    : cat === '임시'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                    : cat === '기억'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                    : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* 미디어 액션 아이콘들 */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCameraCapture}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
              title="카메라로 촬영"
            >
              <Icon name="Camera" size={18} className="text-blue-600" />
            </button>
            <button
              type="button"
              onClick={handleGallerySelect}
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
              title="갤러리에서 선택"
            >
              <Icon name="Image" size={18} className="text-green-600" />
            </button>
            <button
              type="button"
              onClick={handleOpenTemplateSidebar}
              className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
              title="상용구 선택"
            >
              <Icon name="FileText" size={18} className="text-purple-600" />
            </button>
          </div>
        </div>

        {/* 내용 입력 */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {clipboardMessage && (
              <div className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {clipboardMessage}
              </div>
            )}
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="메모 내용을 입력하세요 (Ctrl+V로 이미지 붙여넣기 가능)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handleClipboardPaste}
              className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start resize-none text-gray-900 dark:text-dark-text bg-white dark:bg-dark-card"
              style={{ fontFamily: 'inherit' }}
            />
            {isProcessingClipboard && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-start"></div>
                  <span className="text-sm text-gray-600">이미지 처리 중...</span>
                </div>
              </div>
            )}
          </div>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
          )}
        </div>

        {/* 이미지 미리보기 */}
        {images.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              첨부된 이미지 ({images.length}개)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.thumbnail || image.data}
                    alt={image.name}
                    className="w-full h-20 object-cover rounded border border-gray-200 dark:border-dark-border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(image)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3">
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
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} />
                {memo ? '수정' : '저장'}
              </>
            )}
          </Button>
        </div>
      </div>

              {/* 상용구 사이드바 */}
        <>
          {/* 배경 오버레이 */}
          <div 
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 ${
              showTemplateSidebar ? 'bg-opacity-30' : 'bg-opacity-0 pointer-events-none'
            }`}
            onClick={handleCloseTemplateSidebar}
          />
          
          {/* 사이드바 */}
          <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-dark-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            showTemplateSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text">상용구</h3>
                <button
                  onClick={handleCloseTemplateSidebar}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary rounded-full transition-colors"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              {/* 상용구 목록 */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-start"></div>
                    <span className="ml-2 text-gray-600 dark:text-dark-text-muted">상용구 목록을 불러오는 중...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="Copy" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 상용구가 없습니다</h4>
                    <p className="text-gray-600 mb-4">상용구 관리에서 새로운 상용구를 등록해보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-start transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="font-medium text-gray-900 mb-1">{template.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{template.content}</div>
                        {template.category && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {template.category}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>

        {/* 전체화면 이미지 뷰어 */}
        <FullscreenImageViewer
          image={selectedImage}
          isOpen={isImageViewerOpen}
          onClose={handleCloseImageViewer}
        />
      </Modal>
    );
  };

export default MemoForm; 