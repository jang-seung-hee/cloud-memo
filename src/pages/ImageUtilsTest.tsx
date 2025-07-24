import React, { useState } from 'react';
import { Button, Card, Modal, Icon } from '../components/ui';
import {
  validateImageFile,
  getImageInfo,
  compressImage,
  resizeImage,
  generateThumbnail,
  encodeImage,
  decodeImage,
  autoAdjustQuality,
  captureImage,
  selectImage,
  captureImageDirect,
  processImage,
  ImageInfo
} from '../utils/imageUtils';

const ImageUtilsTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [processedImage, setProcessedImage] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');

  const showModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      loadImageInfo(file);
    }
  };

  const loadImageInfo = async (file: File) => {
    try {
      const info = await getImageInfo(file);
      setImageInfo(info);
    } catch (error) {
      console.error('이미지 정보 로드 실패:', error);
    }
  };

  const handleCompressImage = async () => {
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      const result = await compressImage(selectedFile, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.7
      });

      setProcessedImage(result.dataUrl);
      showModal(`이미지 압축 완료!\n원본 크기: ${imageInfo?.width}x${imageInfo?.height}\n압축 크기: ${result.info.width}x${result.info.height}\n원본 크기: ${(selectedFile.size / 1024).toFixed(1)}KB\n압축 크기: ${(result.file.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      alert(`압축 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleResizeImage = async () => {
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      const result = await resizeImage(selectedFile, 400, 300, {
        quality: 0.8
      });

      setProcessedImage(result.dataUrl);
      showModal(`이미지 리사이징 완료!\n새 크기: ${result.info.width}x${result.info.height}\n파일 크기: ${(result.file.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      alert(`리사이징 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      const result = await generateThumbnail(selectedFile, {
        width: 150,
        height: 150,
        quality: 0.6
      });

      setThumbnail(result.dataUrl);
      showModal(`썸네일 생성 완료!\n썸네일 크기: ${result.info.width}x${result.info.height}\n파일 크기: ${(result.file.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      alert(`썸네일 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleAutoAdjustQuality = async () => {
    if (!selectedFile) {
      alert('이미지를 선택해주세요.');
      return;
    }

    try {
      const result = await autoAdjustQuality(selectedFile, 500 * 1024); // 500KB

      setProcessedImage(result.dataUrl);
      showModal(`품질 자동 조정 완료!\n목표 크기: 500KB\n실제 크기: ${(result.file.size / 1024).toFixed(1)}KB\n압축률: ${((1 - result.file.size / selectedFile.size) * 100).toFixed(1)}%`);
    } catch (error) {
      alert(`품질 조정 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await selectImage({
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8
      });

      setSelectedFile(result.file);
      setProcessedImage(result.dataUrl);
      setImageInfo(result.info);
      showModal(`갤러리에서 이미지 선택 완료!\n파일명: ${result.file.name}\n크기: ${result.info.width}x${result.info.height}\n파일 크기: ${(result.file.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('취소')) {
        // 사용자가 취소한 경우는 알림하지 않음
        return;
      }
      alert(`이미지 선택 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleCaptureImage = async () => {
    try {
      const result = await captureImageDirect({
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8
      });

      setSelectedFile(result.file);
      setProcessedImage(result.dataUrl);
      setImageInfo(result.info);
      showModal(`카메라 촬영 완료!\n파일명: ${result.file.name}\n크기: ${result.info.width}x${result.info.height}\n파일 크기: ${(result.file.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('취소')) {
        // 사용자가 취소한 경우는 알림하지 않음
        return;
      }
      alert(`카메라 촬영 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleProcessImage = async (source: 'camera' | 'gallery' | 'capture') => {
    try {
      const result = await processImage(source, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8
      });

      setSelectedFile(result.file);
      setProcessedImage(result.dataUrl);
      setThumbnail(result.thumbnail?.dataUrl || '');
      setImageInfo(result.info);
      
      const sourceName = source === 'camera' ? '카메라' : source === 'gallery' ? '갤러리' : '직접 촬영';
      showModal(`${sourceName} 이미지 처리 완료!\n파일명: ${result.file.name}\n크기: ${result.info.width}x${result.info.height}\n파일 크기: ${(result.file.size / 1024).toFixed(1)}KB\n썸네일: ${result.thumbnail ? '생성됨' : '생성 안됨'}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('취소')) {
        // 사용자가 취소한 경우는 알림하지 않음
        return;
      }
      alert(`이미지 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-start to-secondary-end p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          이미지 처리 유틸리티 테스트
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이미지 선택 및 정보 */}
          <Card title="이미지 선택 및 정보" className="mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 파일 선택
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-start file:text-white hover:file:bg-primary-end"
                />
              </div>

              {imageInfo && (
                <div className="p-4 border rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">이미지 정보</h4>
                  <div className="text-sm space-y-1">
                    <div>크기: {imageInfo.width} x {imageInfo.height}</div>
                    <div>파일 크기: {(imageInfo.size / 1024).toFixed(1)}KB</div>
                    <div>타입: {imageInfo.type}</div>
                    <div>비율: {imageInfo.aspectRatio.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="p-4 border rounded bg-gray-50">
                  <h4 className="font-semibold mb-2">선택된 파일</h4>
                  <div className="text-sm space-y-1">
                    <div>파일명: {selectedFile.name}</div>
                    <div>크기: {(selectedFile.size / 1024).toFixed(1)}KB</div>
                    <div>타입: {selectedFile.type}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 이미지 처리 기능 */}
          <Card title="이미지 처리 기능" className="mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleCompressImage} variant="primary" disabled={!selectedFile}>
                  <Icon name="Settings" size={16} />
                  압축
                </Button>
                <Button onClick={handleResizeImage} variant="primary" disabled={!selectedFile}>
                  <Icon name="Edit" size={16} />
                  리사이징
                </Button>
                <Button onClick={handleGenerateThumbnail} variant="primary" disabled={!selectedFile}>
                  <Icon name="Image" size={16} />
                  썸네일
                </Button>
                <Button onClick={handleAutoAdjustQuality} variant="primary" disabled={!selectedFile}>
                  <Icon name="Settings" size={16} />
                  품질 조정
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">이미지 가져오기</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => handleProcessImage('gallery')} variant="outline">
                    <Icon name="FileText" size={16} />
                    갤러리
                  </Button>
                  <Button onClick={() => handleProcessImage('capture')} variant="outline">
                    <Icon name="Camera" size={16} />
                    촬영
                  </Button>
                  <Button onClick={() => handleProcessImage('camera')} variant="outline">
                    <Icon name="Camera" size={16} />
                    카메라
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 이미지 미리보기 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {selectedFile && (
            <Card title="원본 이미지" className="mb-8">
              <div className="space-y-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="원본"
                  className="w-full h-48 object-cover rounded"
                />
                <div className="text-sm text-gray-600">
                  {imageInfo && `${imageInfo.width} x ${imageInfo.height}`}
                </div>
              </div>
            </Card>
          )}

          {processedImage && (
            <Card title="처리된 이미지" className="mb-8">
              <div className="space-y-2">
                <img
                  src={processedImage}
                  alt="처리됨"
                  className="w-full h-48 object-cover rounded"
                />
                <div className="text-sm text-gray-600">
                  {imageInfo && `${imageInfo.width} x ${imageInfo.height}`}
                </div>
              </div>
            </Card>
          )}

          {thumbnail && (
            <Card title="썸네일" className="mb-8">
              <div className="space-y-2">
                <img
                  src={thumbnail}
                  alt="썸네일"
                  className="w-full h-48 object-cover rounded"
                />
                <div className="text-sm text-gray-600">
                  150 x 150
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 결과 모달 */}
      <Modal
        isOpen={isModalOpen}
        title="처리 결과"
        onClose={() => setIsModalOpen(false)}
      >
        <pre className="whitespace-pre-wrap text-sm">{modalContent}</pre>
      </Modal>
    </div>
  );
};

export default ImageUtilsTest; 