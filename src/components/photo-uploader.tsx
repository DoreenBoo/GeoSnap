'use client';

import { useRef, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  onPhotoUploaded: (photoDataUri: string, fileName: string) => void;
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
          title: 'Invalid File Type',
          description: 'Please select an image file.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        if (typeof e.target?.result === 'string') {
          onPhotoUploaded(e.target.result, file.name);
        }
      };
      reader.onerror = () => {
         toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
      }
      reader.readAsDataURL(file);
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
        accept="image/*"
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
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </span>
      </Button>
    </>
  );
};

export default PhotoUploader;
