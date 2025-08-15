'use client';

import type { FC } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Photo } from '@/lib/types';

interface MapViewProps {
  photos: Photo[];
  onMarkerClick: (photo: Photo) => void;
}

const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
];

const MapView: FC<MapViewProps> = ({ photos, onMarkerClick }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div>API key for Google Maps is not configured.</div>;
  }
  
  const center = photos.length > 0 ? photos[0].location : { lat: 48.8584, lng: 2.2945 };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={3}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={'a2b3c4d5e6f7g8h9'}
        styles={mapStyles}
        className="w-full h-full"
      >
        {photos.map(photo => (
          <AdvancedMarker
            key={photo.id}
            position={photo.location}
            onClick={() => onMarkerClick(photo)}
          >
            <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-lg">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
};

export default MapView;
