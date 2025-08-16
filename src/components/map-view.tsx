
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface MapViewProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
}

const PhotoMarker = ({ map, photo, onClick }: { map: any; photo: Photo; onClick: (photo: Photo) => void }) => {
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !window.AMap) return;

    const el = document.createElement('div');
    el.style.position = 'relative';
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.background = 'white';
    el.style.borderRadius = '50% 50% 50% 0';
    el.style.transform = 'rotate(-45deg)';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;
    img.style.width = '44px';
    img.style.height = '44px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.transform = 'rotate(45deg)';
    img.style.pointerEvents = 'none';

    el.appendChild(img);

    const marker = new window.AMap.Marker({
      position: new window.AMap.LngLat(photo.location.lng, photo.location.lat),
      content: el,
      offset: new window.AMap.Pixel(-25, -50),
      title: photo.name,
    });
    
    marker.on('click', () => onClick(photo));
    map.add(marker);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        map.remove(markerRef.current);
      }
    };
  }, [map, photo, onClick]);

  return null; 
};


const MapView = ({ photos, onMarkerClick }: MapViewProps) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [center, setCenter] = useState({ lat: 39.9163, lng: 116.3972 });
  const [zoom, setZoom] = useState(5);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY;
    if (!apiKey) {
      toast({ variant: 'destructive', title: '配置缺失', description: '高德地图API Key未设置' });
      return;
    }

    if (window.AMap) {
        setIsApiLoaded(true);
        return;
    }
    
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`;
    script.async = true;
    script.onload = () => {
      setIsApiLoaded(true);
    };
    script.onerror = () => {
      toast({ variant: 'destructive', title: '加载失败', description: '高德地图脚本加载失败，请检查网络或API Key' });
    };
    document.head.appendChild(script);

  }, [toast]);


  useEffect(() => {
    if (isApiLoaded && mapContainerRef.current && !mapInstance) {
      const map = new window.AMap.Map(mapContainerRef.current, {
        zoom: zoom,
        center: [center.lng, center.lat],
        viewMode: '2D',
        dragEnable: true,
        zoomEnable: true,
      });
      mapRef.current = map;
      setMapInstance(map);
    }
    
    return () => {
        if(mapRef.current) {
            mapRef.current.destroy();
            setMapInstance(null);
            mapRef.current = null;
        }
    }
  }, [isApiLoaded, mapInstance, zoom, center.lng, center.lat]);

  useEffect(() => {
    if (mapInstance && photos.length > 0) {
      const lastPhoto = photos[photos.length - 1];
      if (lastPhoto.isNew) {
        mapInstance.setCenter([lastPhoto.location.lng, lastPhoto.location.lat]);
        mapInstance.setZoom(12);
      } else if (photos.length === 1) {
        mapInstance.setCenter([photos[0].location.lng, photos[0].location.lat]);
        mapInstance.setZoom(12);
      }
    }
  }, [photos, mapInstance]);

  return (
    <div ref={mapContainerRef} className="w-full h-full">
      {!isApiLoaded && (
         <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">正在加载地图...</p>
         </div>
      )}
      {isApiLoaded && mapInstance && photos.map(photo => (
        <PhotoMarker key={photo.id} map={mapInstance} photo={photo} onClick={onMarkerClick} />
      ))}
    </div>
  );
};

export default MapView;

    