'use client';

import { useState } from 'react';
import type { Photo } from '@/lib/types';
import { suggestPhotoTags } from '@/ai/flows/suggest-photo-tags';
import { useToast } from '@/hooks/use-toast';

import MapView from '@/components/map-view';
import PhotoDialog from '@/components/photo-dialog';
import PhotoUploader from '@/components/photo-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

const initialPhotos: Photo[] = [
  {
    id: '1',
    name: 'Eiffel Tower',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'eiffel tower',
    location: { lat: 48.8584, lng: 2.2945 },
    tags: ['paris', 'architecture', 'tower', 'landmark'],
  },
  {
    id: '2',
    name: 'Colosseum',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'colosseum rome',
    location: { lat: 41.8902, lng: 12.4922 },
    tags: ['rome', 'history', 'ruins', 'amphitheater'],
  },
  {
    id: '3',
    name: 'Statue of Liberty',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'statue liberty',
    location: { lat: 40.6892, lng: -74.0445 },
    tags: ['new york', 'landmark', 'statue', 'usa'],
  },
  {
    id: '4',
    name: 'Golden Gate Bridge',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'golden gate',
    location: { lat: 37.8199, lng: -122.4783 },
    tags: ['san francisco', 'bridge', 'engineering', 'ocean'],
  },
];

export default function Home() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoDialogOpen, setPhotoDialogOpen] = useState(false);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async (photoDataUri: string, fileName: string) => {
    setIsUploading(true);
    try {
      // Simulate extracting GPS data from EXIF (or manual addition)
      // For this demo, we'll assign a random location near the last one.
      const lastLocation = photos.length > 0 ? photos[photos.length - 1].location : { lat: 34.0522, lng: -118.2437 };
      const newLocation = {
        lat: lastLocation.lat + (Math.random() - 0.5) * 0.1,
        lng: lastLocation.lng + (Math.random() - 0.5) * 0.1,
      };

      // Get AI-suggested tags
      const result = await suggestPhotoTags({ photoDataUri });

      const newPhoto: Photo = {
        id: new Date().toISOString(),
        name: fileName,
        src: photoDataUri,
        location: newLocation,
        tags: result.tags,
      };

      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      setSelectedPhoto(newPhoto);
      setPhotoDialogOpen(true);

    } catch (error) {
      console.error('Error processing photo:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not get tags for the photo. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE";

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {hasApiKey ? (
         <MapView photos={photos} onMarkerClick={handleMarkerClick} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
           <Card className="w-1/3 text-center">
             <CardHeader>
              <CardTitle>Welcome to GeoSnap!</CardTitle>
             </CardHeader>
             <CardContent>
              <p>To see the interactive map, please add your Google Maps API key to a <code className="bg-secondary p-1 rounded-md">.env.local</code> file.</p>
             </CardContent>
           </Card>
        </div>
      )}

      <div className="absolute bottom-6 right-6 z-10">
        <PhotoUploader onPhotoUploaded={handlePhotoUpload} isUploading={isUploading} />
      </div>

      <PhotoDialog
        photo={selectedPhoto}
        open={isPhotoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
      />
      
      <header className="absolute top-0 left-0 p-4 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Camera className="text-primary"/>
              GeoSnap
            </h1>
        </div>
      </header>
    </div>
  );
}
