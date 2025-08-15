'use client';

import { useState, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import MapView from '@/components/map-view';
import PhotoDialog from '@/components/photo-dialog';
import PhotoUploader from '@/components/photo-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

const initialPhotos: Photo[] = [
  {
    id: '1',
    name: '故宫博物院',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'forbidden city',
    location: { lat: 39.9163, lng: 116.3972 },
    tags: ['beijing', 'palace', 'history', 'landmark'],
  },
  {
    id: '2',
    name: '东方明珠',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'oriental pearl tower',
    location: { lat: 31.2397, lng: 121.4998 },
    tags: ['shanghai', 'tower', 'landmark', 'modern'],
  },
  {
    id: '3',
    name: '兵马俑',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'terracotta army',
    location: { lat: 34.3853, lng: 109.2792 },
    tags: ['xi\'an', 'history', 'sculpture', 'tomb'],
  },
  {
    id: '4',
    name: '维多利亚港',
    src: 'https://placehold.co/800x600.png',
    dataAiHint: 'victoria harbour',
    location: { lat: 22.284, lng: 114.1655 },
    tags: ['hong kong', 'harbor', 'skyline', 'cityscape'],
  },
];

export default function Home() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [isMapReady, setMapReady] = useState(false);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async (photoDataUri: string, fileName: string) => {
    setIsUploading(true);
    try {
      // For this demo, we'll assign a random location near the last one.
      const lastLocation = photos.length > 0 ? photos[photos.length - 1].location : { lat: 39.9163, lng: 116.3972 };
      const newLocation = {
        lat: lastLocation.lat + (Math.random() - 0.5) * 0.2,
        lng: lastLocation.lng + (Math.random() - 0.5) * 0.2,
      };

      const newPhoto: Photo = {
        id: new Date().toISOString(),
        name: fileName,
        src: photoDataUri,
        location: newLocation,
        tags: [],
      };

      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      setSelectedPhoto(newPhoto);
      setPhotoDialogOpen(true);

    } catch (error) {
      console.error('Error processing photo:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'Could not process the photo. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const hasApiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY && process.env.NEXT_PUBLIC_AMAP_API_KEY !== "YOUR_API_KEY_HERE";
  const hasSecurityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE && process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE !== "YOUR_SECURITY_CODE_HERE";

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {hasApiKey && hasSecurityCode ? (
         <MapView photos={photos} onMarkerClick={handleMarkerClick} onMapReady={setMapReady} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
           <Card className="w-2/3 text-center">
             <CardHeader>
              <CardTitle>欢迎来到 GeoSnap!</CardTitle>
             </CardHeader>
             <CardContent>
              <p className="mb-2">要查看交互式地图，请将您的高德地图 API Key 和安全密钥添加到 <code className="bg-secondary p-1 rounded-md">.env.local</code> 文件中。</p>
              <p className="text-sm text-muted-foreground">
                NEXT_PUBLIC_AMAP_API_KEY=YOUR_API_KEY_HERE<br/>
                NEXT_PUBLIC_AMAP_SECURITY_CODE=YOUR_SECURITY_CODE_HERE
              </p>
             </CardContent>
           </Card>
        </div>
      )}

      {isMapReady && (
         <div className="absolute bottom-6 right-6 z-10">
          <PhotoUploader onPhotoUploaded={handlePhotoUpload} isUploading={isUploading} />
        </div>
      )}


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
