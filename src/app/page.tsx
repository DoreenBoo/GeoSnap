
'use client';

import { useState, useEffect } from 'react';
import type { Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import * as EXIF from 'exif-js';

import MapView from '@/components/map-view';
import PhotoDialog from '@/components/photo-dialog';
import PhotoUploader from '@/components/photo-uploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPhotoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [webServiceApiKey, setWebServiceApiKey] = useState('');

  useEffect(() => {
    const wsApiKey = process.env.NEXT_PUBLIC_AMAP_WEBSERVICE_API_KEY?.trim();

    if (wsApiKey) {
      setWebServiceApiKey(wsApiKey);
    }
  }, []);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const processFile = (file: File): Promise<Photo | null> => {
    return new Promise((resolve) => {
      if (!webServiceApiKey) {
        toast({ variant: 'destructive', title: '配置不完整', description: 'Web服务API Key未设置，无法进行逆地理编码。' });
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result !== 'string') {
          toast({ variant: 'destructive', title: '文件读取失败', description: `无法读取文件: ${file.name}` });
          resolve(null);
          return;
        }
        const photoDataUri = e.target.result;
        
        EXIF.getData(file as any, function(this: any) {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");

          if (lat && lon) {
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";
            const latitude = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === "N" ? 1 : -1);
            const longitude = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef === "E" ? 1 : -1);
            
            fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${webServiceApiKey}&location=${longitude},${latitude}&coordsys=gps`)
              .then(response => response.json())
              .then(data => {
                if (data.status === '1' && data.regeocode) {
                  const newPhoto: Photo = {
                    id: `${new Date().toISOString()}-${file.name}`,
                    name: data.regeocode.formatted_address || file.name,
                    src: photoDataUri,
                    location: { lat: latitude, lng: longitude },
                    tags: [],
                    isNew: true,
                  };
                  resolve(newPhoto);
                } else {
                   toast({ 
                      variant: 'destructive', 
                      title: '逆地理编码失败', 
                      description: `照片 "${file.name}" 无法获取位置。高德地图: ${data.info || '未知错误'}` 
                    });
                   resolve(null);
                }
              })
              .catch(error => {
                 console.error('逆地理编码请求错误:', error);
                 toast({ variant: 'destructive', title: '获取位置信息失败', description: '网络请求失败，请检查您的网络连接。' });
                 resolve(null);
              });
          } else {
            toast({ variant: 'destructive', title: '缺少GPS信息', description: `照片 "${file.name}" 中未找到GPS数据。` });
            resolve(null);
          }
        });
      };
      reader.onerror = () => {
         toast({ variant: 'destructive', title: '文件读取错误', description: `无法读取所选文件: ${file.name}` });
         resolve(null);
      }
      reader.readAsDataURL(file);
    });
  };

  const handlePhotosUpload = async (files: FileList) => {
    setIsUploading(true);
    const newPhotosPromises = Array.from(files).map(processFile);
    const newPhotos = (await Promise.all(newPhotosPromises)).filter(p => p !== null) as Photo[];

    if (newPhotos.length > 0) {
      setPhotos(prevPhotos => {
        const photosWithClearedNewFlag = prevPhotos.map(p => p.isNew ? {...p, isNew: false} : p);
        return [...photosWithClearedNewFlag, ...newPhotos];
      });
      setSelectedPhoto(newPhotos[0]);
      setPhotoDialogOpen(true);
    }
    
    setIsUploading(false);
  };
  
  const handleSavePhoto = (updatedPhoto: Photo) => {
    setPhotos(prevPhotos => {
        return prevPhotos.map(p => {
          if (p.id === updatedPhoto.id) {
            const { isNew, ...photoToSave } = updatedPhoto;
            return photoToSave;
          }
          return p.isNew ? { ...p, isNew: false } : p;
        });
    });
    setPhotoDialogOpen(false);
    setSelectedPhoto(null);
  };


  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView photos={photos} onMarkerClick={handleMarkerClick} />

       <div className="absolute bottom-6 right-6 z-10">
        <PhotoUploader onPhotosUploaded={handlePhotosUpload} isUploading={isUploading} />
      </div>

      <PhotoDialog
        photo={selectedPhoto}
        open={isPhotoDialogOpen}
        onOpenChange={setPhotoDialogOpen}
        onSave={handleSavePhoto}
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

    