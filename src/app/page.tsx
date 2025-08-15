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
  const [hasValidKeys, setHasValidKeys] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Trim values to handle potential whitespace issues from copy-pasting
    const key = process.env.NEXT_PUBLIC_AMAP_API_KEY?.trim();
    const securityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE?.trim();

    if (key && key !== 'YOUR_API_KEY_HERE' && securityCode && securityCode !== 'YOUR_SECURITY_CODE_HERE') {
      setHasValidKeys(true);
      setApiKey(key);
    } else {
      setHasValidKeys(false);
    }
  }, []);

  const handleMarkerClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result !== 'string') {
        toast({ variant: 'destructive', title: '文件读取失败' });
        setIsUploading(false);
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
          
          fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&coordsys=gps`)
            .then(response => response.json())
            .then(data => {
              if (data.status === '1' && data.regeocode) {
                const newPhoto: Photo = {
                  id: new Date().toISOString(),
                  name: data.regeocode.formatted_address || file.name,
                  src: photoDataUri,
                  location: { lat: latitude, lng: longitude },
                  tags: [],
                  isNew: true,
                };
                setSelectedPhoto(newPhoto);
                setPhotoDialogOpen(true);
              } else {
                 toast({ 
                    variant: 'destructive', 
                    title: '逆地理编码失败', 
                    description: `无法获取该坐标的位置信息。高德地图返回: ${data.info || '未知错误'}` 
                  });
              }
            })
            .catch(error => {
               console.error('逆地理编码请求错误:', error);
               toast({ variant: 'destructive', title: '获取位置信息失败', description: '网络请求失败，请检查您的网络连接或稍后重试。' });
            })
            .finally(() => setIsUploading(false));
        } else {
          toast({ variant: 'destructive', title: '照片中未找到GPS信息' });
          setIsUploading(false);
        }
      });
    };

    reader.onerror = () => {
       toast({ variant: 'destructive', title: '文件读取错误', description: '无法读取所选文件。' });
       setIsUploading(false);
    }
    reader.readAsDataURL(file);
  };
  
  const handleSavePhoto = (updatedPhoto: Photo) => {
    const { isNew, ...photoToSave } = updatedPhoto;
    setPhotos(prevPhotos => [...prevPhotos, photoToSave]);
    setPhotoDialogOpen(false);
    setSelectedPhoto(null);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {hasValidKeys ? (
         <MapView photos={photos} onMarkerClick={handleMarkerClick} onMapReady={setMapReady} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
           <Card className="w-2/3 max-w-lg text-center">
             <CardHeader>
              <CardTitle>欢迎来到 GeoSnap!</CardTitle>
             </CardHeader>
             <CardContent>
              <p className="mb-4">要查看交互式地图，请在项目根目录创建 <code className="bg-secondary p-1 rounded-md">.env.local</code> 文件，并添加您的高德地图 API Key 和安全密钥。</p>
              <div className="bg-secondary p-4 rounded-md text-left text-sm text-muted-foreground">
                <pre><code>
                NEXT_PUBLIC_AMAP_API_KEY=YOUR_API_KEY_HERE<br/>
                NEXT_PUBLIC_AMAP_SECURITY_CODE=YOUR_SECURITY_CODE_HERE
                </code></pre>
              </div>
               <p className="mt-4 text-sm">添加或修改后，请务必<strong className="text-primary">重启开发服务器</strong> (在终端按 Ctrl+C 然后重新运行 npm run dev)。</p>
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
