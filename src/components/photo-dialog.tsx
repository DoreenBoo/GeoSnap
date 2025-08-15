'use client';

import type { FC } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Photo } from '@/lib/types';

interface PhotoDialogProps {
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PhotoDialog: FC<PhotoDialogProps> = ({ photo, open, onOpenChange }) => {
  if (!photo) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="truncate">{photo.name}</DialogTitle>
           <DialogDescription>
            {`Lat: ${photo.location.lat.toFixed(4)}, Lng: ${photo.location.lng.toFixed(4)}`}
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden my-4">
          <Image
            src={photo.src}
            alt={photo.name}
            fill
            className="object-cover"
            data-ai-hint={photo.dataAiHint}
          />
        </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDialog;
