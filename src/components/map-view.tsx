
'use client';

import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Photo } from '@/lib/types';

interface MapViewProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
}

// Custom Marker Component
const PhotoMarker = ({ photo, onClick }: { photo: Photo, onClick: () => void }) => {
  return (
    <AdvancedMarker
      position={photo.location}
      onClick={onClick}
      title={photo.name}
    >
        <div style={{
          position: 'relative',
          width: '50px',
          height: '50px',
          background: 'white',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}>
          <img 
            src={photo.src} 
            alt={photo.name} 
            style={{
              width: '44px', 
              height: '44px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              transform: 'rotate(45deg)',
              pointerEvents: 'none',
            }} 
          />
        </div>
    </AdvancedMarker>
  );
};

const MapView = ({ photos, onMarkerClick }: MapViewProps) => {
  const [apiKey, setApiKey] = useState('');
  const [center, setCenter] = useState({ lat: 39.9163, lng: 116.3972 });
  const [zoom, setZoom] = useState(5);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_API_KEY;
    if (key) {
      setApiKey(key);
    }
  }, []);

  useEffect(() => {
    if (photos.length > 0) {
      const lastPhoto = photos[photos.length - 1];
       if (lastPhoto.isNew) {
         setCenter(lastPhoto.location);
         setZoom(12);
       } else if (photos.length === 1) {
         setCenter(photos[0].location);
         setZoom(12);
       }
    }
  }, [photos]);


  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">正在加载地图...</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} version="2.0" solutionChannel="GMP_devsite_samples_v3_rgmautocomplete">
      <Map
        ref={mapRef}
        mapId={'bf51a910020fa25a'}
        zoom={zoom}
        center={center}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="w-full h-full"
        mapType="amap"
      >
        {photos.map((photo) => (
          <PhotoMarker 
            key={photo.id} 
            photo={photo}
            onClick={() => onMarkerClick(photo)}
          />
        ))}
      </Map>
    </APIProvider>
  );
};

export default MapView;
