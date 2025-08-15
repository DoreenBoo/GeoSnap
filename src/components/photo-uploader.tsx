'use client';

import { useRef, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  onPhotosUploaded: (files: FileList) => void;
  isUploading: boolean;
}

const PhotoUploader: FC<PhotoUploaderProps> = ({ onPhotosUploaded, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
       for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          toast({
            variant: 'destructive',
            title: '文件类型无效',
            description: `文件 "${files[i].name}" 不是一个图片文件。`,
          });
          // Reset file input to prevent re-uploading the same invalid set
          event.target.value = '';
          return;
        }
      }
      onPhotosUploaded(files);
    }
    // Reset file input to allow uploading the same file(s) again
    event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png"
        disabled={isUploading}
        multiple // Allow multiple file selection
      />
      <Button
        size="lg"
        className="rounded-full shadow-lg"
        onClick={handleButtonClick}
        disabled={isUploading}
        aria-label="Upload Photos"
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
