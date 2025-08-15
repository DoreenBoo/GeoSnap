'use client';

import { useState, useEffect, type FC } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Photo } from '@/lib/types';

interface PhotoDialogProps {
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (photo: Photo) => void;
}

const PhotoDialog: FC<PhotoDialogProps> = ({ photo, open, onOpenChange, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (photo) {
      setName(photo.name);
    }
  }, [photo]);

  if (!photo) {
    return null;
  }

  const handleSave = () => {
    if (onSave) {
      onSave({ ...photo, name });
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (photo.isNew && !isOpen && onSave) {
      // If it's a new photo, 'closing' it means saving it.
      handleSave();
    } else {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
           {photo.isNew ? (
            <DialogTitle>新照片</DialogTitle>
          ) : (
            <DialogTitle className="truncate">{photo.name}</DialogTitle>
          )}
           <DialogDescription>
            {`纬度: ${photo.location.lat.toFixed(4)}, 经度: ${photo.location.lng.toFixed(4)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 mt-2">
            <label htmlFor="photo-name" className="text-sm font-medium">位置名称</label>
            <Input
                id="photo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：北京市天安门广场"
            />
        </div>
     
        <div className="relative w-full aspect-video rounded-lg overflow-hidden my-4">
          <Image
            src={photo.src}
            alt={photo.name}
            fill
            className="object-cover"
            data-ai-hint={photo.dataAiHint}
          />
        </div>

        {!photo.isNew && (
          <div className="flex flex-wrap gap-2">
            {photo.tags.length > 0 ? (
              photo.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))
            ) : (
               <p className="text-sm text-muted-foreground">No tags available.</p>
            )}
          </div>
        )}
        
        {onSave && (
          <DialogFooter>
            <Button onClick={handleSave}>
              {photo.isNew ? '添加到地图' : '更新信息'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDialog;
