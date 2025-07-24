import React, { useState } from 'react';
import { Card, Button, Icon } from '../components/ui';
import type { Image } from '../types/image';

const ClipboardTest: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  // 모바일 환경 감지
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 클립보드 붙여넣기 처리 (PC용)
  const handlePaste = async (e: React.ClipboardEvent) => {
    // 모바일에서는 전역 이벤트 리스너가 처리하므로 PC에서만 실행
    if (isMobile) return;
    
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        
        try {
          setIsProcessing(true);
          setMessage('');
          const file = item.getAsFile();
          
          if (file) {
            console.log('PC 클립보드에서 이미지 감지:', file.name, file.size, file.type);
            
            // 간단한 이미지 처리 (실제로는 processImage 함수 사용)
            const reader = new FileReader();
            reader.onload = () => {
              const image: Image = {
                id: `img_${Date.now()}_pc_clipboard`,
                data: reader.result as string,
                name: `pc_clipboard_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`,
                size: file.size,
                type: file.type,
                uploadedAt: new Date()
              };

              setUploadedImages(prev => [...prev, image]);
              setMessage('✅ 이미지가 성공적으로 추가되었습니다!');
              setTimeout(() => setMessage(''), 3000);
            };
            reader.readAsDataURL(file);
          }
        } catch (error) {
          console.error('PC 클립보드 이미지 처리 실패:', error);
          setMessage('❌ 이미지 처리에 실패했습니다.');
          setTimeout(() => setMessage(''), 3000);
        } finally {
          setIsProcessing(false);
        }
        break;
      }
    }
  };



  // 모바일 전역 paste 이벤트 리스너
  React.useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      if (!isMobile) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          
          try {
            setIsProcessing(true);
            setMessage('');
            const file = item.getAsFile();
            
            if (file) {
              console.log('모바일 전역 클립보드에서 이미지 감지:', file.name, file.size, file.type);
              
              const reader = new FileReader();
              reader.onload = () => {
                const image: Image = {
                  id: `img_${Date.now()}_mobile_global`,
                  data: reader.result as string,
                  name: `mobile_global_${Date.now()}.${file.type.split('/')[1] || 'jpg'}`,
                  size: file.size,
                  type: file.type,
                  uploadedAt: new Date()
                };

                setUploadedImages(prev => [...prev, image]);
                setMessage('✅ 이미지가 성공적으로 추가되었습니다!');
                console.log('모바일 전역 클립보드 이미지 추가 완료');
                
                setTimeout(() => setMessage(''), 3000);
              };
              reader.readAsDataURL(file);
            }
          } catch (error) {
            console.error('모바일 전역 클립보드 이미지 처리 실패:', error);
            setMessage('❌ 이미지 처리에 실패했습니다.');
            setTimeout(() => setMessage(''), 3000);
          } finally {
            setIsProcessing(false);
          }
          break;
        }
      }
    };

    if (isMobile) {
      document.addEventListener('paste', handleGlobalPaste);
      
      return () => {
        document.removeEventListener('paste', handleGlobalPaste);
      };
    }
  }, [isMobile]);

  // 이미지 삭제
  const handleImageDelete = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // 모든 이미지 삭제
  const handleClearAll = () => {
    if (window.confirm('모든 이미지를 삭제하시겠습니까?')) {
      setUploadedImages([]);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          클립보드 이미지 붙여넣기 테스트
        </h1>

        {/* 사용 방법 안내 */}
        <Card title="사용 방법" className="mb-8">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">PC에서 테스트:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>이미지를 복사하거나 스크린샷을 찍습니다</li>
                <li>아래 텍스트 영역을 클릭합니다</li>
                <li>Ctrl+V (또는 Cmd+V)로 붙여넣기합니다</li>
              </ol>
            </div>
            
                         <div className="mb-4">
               <h3 className="text-lg font-medium mb-2">모바일에서 테스트:</h3>
               <ol className="list-decimal list-inside space-y-1 text-gray-600">
                 <li>이미지를 복사합니다</li>
                 <li>텍스트 영역을 길게 누른 후 붙여넣기를 선택합니다</li>
               </ol>
             </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 팁:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 스크린샷: Windows에서는 Win+Shift+S, Mac에서는 Cmd+Shift+4</li>
                <li>• 웹 이미지: 이미지에서 우클릭 → "이미지 복사"</li>
                <li>• 파일 이미지: 파일 탐색기에서 이미지 파일 복사</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* 클립보드 붙여넣기 테스트 */}
        <Card title="클립보드 붙여넣기 테스트" className="mb-8">
          <div className="p-6">
            <div className="mb-4">
              {message && (
                <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-200">
                  {message}
                </div>
              )}
            </div>
            
            
             
             <div className="relative">
               <textarea
                 placeholder="여기에 이미지를 붙여넣으세요..."
                 className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start focus:border-primary-start resize-none"
                 onPaste={handlePaste}
               />
               {isProcessing && (
                 <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-md">
                   <div className="flex items-center space-x-2">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-start"></div>
                     <span className="text-sm text-gray-600">이미지 처리 중...</span>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </Card>

        {/* 업로드된 이미지 목록 */}
        {uploadedImages.length > 0 && (
          <Card title={`업로드된 이미지 (${uploadedImages.length}개)`} className="mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  총 {uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024} MB
                </span>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={14} />
                  <span className="ml-1">모두 삭제</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.data}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => handleImageDelete(image.id)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-200"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{image.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 디버그 정보 */}
        <Card title="디버그 정보" className="mb-8">
          <div className="p-6">
            <div className="space-y-2 text-sm">
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Platform:</strong> {navigator.platform}</p>
              <p><strong>Clipboard API 지원:</strong> {navigator.clipboard ? 'Yes' : 'No'}</p>
              <p><strong>이미지 개수:</strong> {uploadedImages.length}</p>
              <p><strong>총 크기:</strong> {formatFileSize(uploadedImages.reduce((sum, img) => sum + img.size, 0))}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClipboardTest; 