
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

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY;
    if (!apiKey) {
      toast({ variant: 'destructive', title: '配置缺失', description: '高德地图API Key未设置' });
      return;
    }

    // Since the script is loaded globally in layout.tsx, we can check for window.AMap
    // If it's not there, we can wait a bit.
    const checkAMap = () => {
      if (window.AMap && window.AMap.Map) {
        initializeMap();
      } else {
        setTimeout(checkAMap, 100); // Check again shortly
      }
    }
    
    const initializeMap = () => {
      if (mapContainerRef.current && !mapRef.current) {
        const map = new window.AMap.Map(mapContainerRef.current, {
          zoom: 5,
          center: [116.3972, 39.9163], // lng, lat
          viewMode: '2D',
          dragEnable: true,
          zoomEnable: true,
        });
        mapRef.current = map;
        setMapInstance(map);
      }
    };
    
    checkAMap();
    
    return () => {
      if(mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
          setMapInstance(null);
      }
    }
  }, [toast]);

  useEffect(() => {
    if (mapInstance && photos.length > 0) {
      const lastPhoto = photos.find(p => p.isNew);
      if (lastPhoto) {
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
      {!mapInstance && (
         <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">正在加载地图...</p>
         </div>
      )}
      {mapInstance && photos.map(photo => (
        <PhotoMarker key={photo.id} map={mapInstance} photo={photo} onClick={onMarkerClick} />
      ))}
    </div>
  );
};

export default MapView;
