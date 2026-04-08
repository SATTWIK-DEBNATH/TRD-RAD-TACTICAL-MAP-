import { useState, useEffect } from 'react';

export interface Vessel {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
}

export const useMaritime = (enabled: boolean) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);

  useEffect(() => {
    if (!enabled) {
      setVessels([]);
      return;
    }

    const mockVessels: Vessel[] = [
      { id: '1', name: 'CSCL GLOBE', type: 'CARGO', latitude: 30.6, longitude: 32.3, speed: 12.5, course: 180 },
      { id: '2', name: 'USS GERALD R. FORD', type: 'MILITARY', latitude: 36.5, longitude: -34.7, speed: 22.0, course: 105 },
      { id: '3', name: 'EVER GIVEN', type: 'CARGO', latitude: 29.9, longitude: 32.5, speed: 0.1, course: 0 },
      { id: '4', name: 'YAMAL SPIRIT', type: 'TANKER', latitude: 70.2, longitude: 50.5, speed: 14.2, course: 270 },
    ];

    setVessels(mockVessels);
    
    // Slight jitter to simulate movement
    const interval = setInterval(() => {
      setVessels(prev => prev.map(v => ({
        ...v,
        latitude: v.latitude + (Math.random() - 0.5) * 0.01,
        longitude: v.longitude + (Math.random() - 0.5) * 0.01,
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled]);

  return { vessels };
};
