'use client';

import { useRef, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  onPhotoUploaded: (file: File) => void;
  isUploading: boolean;
}

const PhotoUploader: FC<PhotoUploaderProps> = ({ onPhotoUploaded, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: '文件类型无效',
          description: '请选择一个图片文件。',
        });
        return;
      }
      onPhotoUploaded(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg"
        disabled={isUploading}
      />
      <Button
        size="lg"
        className="rounded-full shadow-lg"
        onClick={handleButtonClick}
        disabled={isUploading}
        aria-label="Upload Photo"
      >
        {isUploading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Upload />
        )}
        <span className={isUploading ? 'sr-only' : 'ml-2'}>
          {isUploading ? '处理中...' : '上传照片'}
        </span>
      </Button>
    </>
  );
};

export default PhotoUploader;
