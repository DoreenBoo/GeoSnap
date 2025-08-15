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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing when it's a new photo that hasn't been saved
      if (photo.isNew && !isOpen) return;
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
           {photo.isNew ? (
            <DialogTitle>确认照片位置</DialogTitle>
          ) : (
            <DialogTitle className="truncate">{photo.name}</DialogTitle>
          )}
           <DialogDescription>
            {`Lat: ${photo.location.lat.toFixed(4)}, Lng: ${photo.location.lng.toFixed(4)}`}
          </DialogDescription>
        </DialogHeader>

        {photo.isNew ? (
            <div className="grid gap-2 mt-2">
                <label htmlFor="photo-name" className="text-sm font-medium">位置名称</label>
                <Input
                    id="photo-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：北京市天安门广场"
                />
            </div>
        ) : null}

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
        
        {photo.isNew && onSave && (
          <DialogFooter>
            <Button onClick={handleSave}>添加到地图</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDialog;
