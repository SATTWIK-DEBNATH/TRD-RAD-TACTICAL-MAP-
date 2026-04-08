import { useState, useEffect } from 'react';

export interface Satellite {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

export const useSpaceLayer = (enabled: boolean) => {
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    if (!enabled) {
      setSatellites([]);
      return;
    }

    // Curated list of notable satellites for the Space Domain Awareness layer
    const mockSats: Satellite[] = [
      { id: 'ISS', name: 'Intl Space Station', type: 'STATION', latitude: 0, longitude: 0, altitude: 420 },
      { id: 'GPS-III', name: 'GPS III-SV01', type: 'NAVIGATION', latitude: 35, longitude: -105, altitude: 20200 },
      { id: 'KH-11', name: 'USA-290 (Keyhole)', type: 'RECON', latitude: 20, longitude: 40, altitude: 400 },
      { id: 'STARLINK-5012', name: 'Starlink 5012', type: 'COMMS', latitude: -10, longitude: -70, altitude: 550 },
    ];

    setSatellites(mockSats);

    // Dynamic movement simulation
    const interval = setInterval(() => {
      setSatellites(prev => prev.map(s => ({
        ...s,
        longitude: (s.longitude + 0.1) > 180 ? -180 : s.longitude + 0.1,
        // Add some sine wave for latitude
        latitude: s.latitude + Math.sin(Date.now() / 10000) * 0.05
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return { satellites };
};
