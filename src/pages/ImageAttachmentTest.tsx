import React, { useState } from 'react';
import { Card, Button, Icon } from '../components/ui';
import ImageUpload from '../components/memo/ImageUpload';
import ImageGallery from '../components/memo/ImageGallery';
import type { Image } from '../types/image';

const ImageAttachmentTest: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  // 이미지 업로드 처리
  const handleImageUpload = (images: Image[]) => {
    setUploadedImages(prev => [...prev, ...images]);
  };

  // 이미지 삭제 처리
  const handleImageDelete = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  // 이미지 선택 처리
  const handleImageSelect = (image: Image) => {
    setSelectedImage(image);
  };

  // 모든 이미지 삭제
  const handleClearAll = () => {
    if (window.confirm('모든 이미지를 삭제하시겠습니까?')) {
      setUploadedImages([]);
      setSelectedImage(null);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          이미지 첨부 테스트
        </h1>

        {/* 클립보드 붙여넣기 테스트 */}
        <Card title="클립보드 붙여넣기 테스트" className="mb-8">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">사용 방법:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>이미지를 복사하거나 스크린샷을 찍습니다</li>
                <li>아래 텍스트 영역을 클릭합니다</li>
                <li>Ctrl+V (또는 Cmd+V)로 붙여넣기합니다</li>
              </ol>
            </div>
            
            <textarea
              placeholder="여기에 Ctrl+V로 이미지를 붙여넣으세요..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start resize-none"
              onPaste={async (e) => {
                console.log('클립보드 붙여넣기 테스트');
                const items = e.clipboardData.items;
                console.log('클립보드 아이템:', items.length);
                
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  console.log(`아이템 ${i}:`, item.type);
                  
                  if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                      console.log('파일 생성됨:', file.name, file.size);
                      // 여기서 이미지 처리 로직을 추가할 수 있습니다
                      alert(`이미지 감지됨: ${file.name} (${formatFileSize(file.size)})`);
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* 이미지 업로드 */}
        <Card title="이미지 업로드 테스트" className="mb-8">
          <div className="p-6">
            <ImageUpload
              onImageUpload={handleImageUpload}
              maxImages={10}
              className="mb-4"
            />
            
            {uploadedImages.length > 0 && (
              <ImageGallery
                images={uploadedImages}
                onImageDelete={handleImageDelete}
                maxImages={6}
              />
            )}
          </div>
        </Card>

        {/* 선택된 이미지 상세 */}
        {selectedImage && (
          <Card title="선택된 이미지 상세" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이미지 */}
              <div className="text-center">
                <img
                  src={selectedImage.data}
                  alt={selectedImage.name}
                  className="max-w-full max-h-64 object-contain rounded-lg border"
                />
              </div>

              {/* 이미지 정보 */}
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">파일명:</span>
                  <p className="text-gray-900">{selectedImage.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">크기:</span>
                  <p className="text-gray-900">{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">타입:</span>
                  <p className="text-gray-900">{selectedImage.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">업로드:</span>
                  <p className="text-gray-900">
                    {new Date(selectedImage.uploadedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <p className="text-gray-900 font-mono text-sm">{selectedImage.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">썸네일:</span>
                  <p className="text-gray-900">{selectedImage.thumbnail ? '있음' : '없음'}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button onClick={handleClearAll} variant="outline">
            <Icon name="Trash2" size={16} />
            <span className="ml-2">모든 이미지 삭제</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageAttachmentTest; 