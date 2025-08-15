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
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    const checkAmapReady = (callback: () => void) => {
      if (window.AMap) {
        callback();
      } else {
        setTimeout(() => checkAmapReady(callback), 100);
      }
    };

    const initMap = () => {
      const center = photos.length > 0 
        ? [photos[0].location.lng, photos[0].location.lat] 
        : [116.3972, 39.9163];

      const map = new window.AMap.Map(mapRef.current!, {
        zoom: 5,
        center: center,
        viewMode: '2D',
      });
      mapInstanceRef.current = map;

      map.on('complete', () => {
          onMapReady(true);
      });
      
      map.on('error', () => {
        toast({
          variant: 'destructive',
          title: '地图加载失败',
          description: '高德地图实例创建失败，请检查API Key或网络。',
        });
        onMapReady(false);
      });

      // Clean up on unmount
      return () => {
        if (map) {
          map.destroy();
        }
      };
    };

    checkAmapReady(() => {
      if (!mapInstanceRef.current) {
         initMap();
      }
    });

  }, []); // Run only once on mount


  useEffect(() => {
    if (!mapInstanceRef.current || !window.AMap || !onMarkerClick) return;

    // Clear existing markers
    mapInstanceRef.current.remove(markersRef.current);
    markersRef.current = [];

    // Add new markers
    photos.forEach(photo => {
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(photo.location.lng, photo.location.lat),
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
        mapInstanceRef.current.setCenter([lastPhoto.location.lng, lastPhoto.location.lat]);
        if (mapInstanceRef.current.getZoom() < 5) {
            mapInstanceRef.current.setZoom(5);
        }
    }

  }, [photos, onMarkerClick]);


  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapView;
