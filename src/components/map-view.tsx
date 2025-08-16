
'use client';

import { useEffect, useRef } from 'react';
import type { Photo } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface MapViewProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
  onMapReady: (isReady: boolean) => void;
}

const MapView = ({ photos, onMarkerClick, onMapReady }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (mapInstanceRef.current) {
      return; // Map already initialized
    }
    
    let isCancelled = false;
    
    const checkAmapReady = (callback: () => void) => {
      if(isCancelled) return;
      
      if (window.AMap && window.AMap.Map) {
        callback();
      } else {
        setTimeout(() => checkAmapReady(callback), 100);
      }
    };

    const initMap = () => {
      if (!mapRef.current) {
        console.error("Map container is not available.");
        onMapReady(false);
        return;
      }
      
      const center = [116.3972, 39.9163];

      try {
        const map = new window.AMap.Map(mapRef.current, {
          zoom: 5,
          center: center,
          viewMode: '2D',
        });
        mapInstanceRef.current = map;

        map.on('complete', () => {
          if (!isCancelled) {
            onMapReady(true);
          }
        });
        
        map.on('error', () => {
          if (!isCancelled) {
            toast({
              variant: 'destructive',
              title: '地图加载失败',
              description: '高德地图实例创建失败，请检查API Key或网络。',
            });
            onMapReady(false);
          }
        });
      } catch (e) {
        console.error("Failed to initialize AMap:", e);
        if (!isCancelled) {
          toast({
              variant: 'destructive',
              title: '地图初始化错误',
              description: '无法初始化地图组件，请检查浏览器控制台获取更多信息。',
            });
          onMapReady(false);
        }
      }
    };

    checkAmapReady(initMap);
    
    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady, toast]); // Run only once on mount


  useEffect(() => {
    if (!mapInstanceRef.current || !window.AMap || !onMarkerClick) return;

    // Clear existing markers
    mapInstanceRef.current.remove(markersRef.current);
    markersRef.current = [];

    // Add new markers
    photos.forEach(photo => {
      const markerContent = `
        <div style="
          position: relative;
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        ">
          <img 
            src="${photo.src}" 
            alt="${photo.name}" 
            style="
              width: 44px; 
              height: 44px; 
              border-radius: 50%; 
              object-fit: cover; 
              transform: rotate(45deg);
              pointer-events: none;
            " 
          />
        </div>
      `;
      
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(photo.location.lng, photo.location.lat),
        content: markerContent,
        offset: new window.AMap.Pixel(-25, -50), // Adjust offset to make the tip point to the location
        title: photo.name,
      });

      marker.on('click', () => {
        onMarkerClick(photo);
        mapInstanceRef.current.setCenter([photo.location.lng, photo.location.lat]);
      });

      markersRef.current.push(marker);
    });
    
    mapInstanceRef.current.add(markersRef.current);

    if (photos.length > 0) {
        const lastPhoto = photos[photos.length - 1];
        if (lastPhoto.isNew) { // Only center on newly added photos
          mapInstanceRef.current.setCenter([lastPhoto.location.lng, lastPhoto.location.lat]);
           if (mapInstanceRef.current.getZoom() < 12) {
             mapInstanceRef.current.setZoom(12);
           }
        } else if (photos.length === 1) { // Center on the first photo if it's not new
            mapInstanceRef.current.setCenter([lastPhoto.location.lng, lastPhoto.location.lat]);
            mapInstanceRef.current.setZoom(12);
        }
    }

  }, [photos, onMarkerClick]);


  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapView;
