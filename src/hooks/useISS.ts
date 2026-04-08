import { useState, useEffect } from 'react';

interface ISSData {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
  type: string;
  severity: string;
  source: string;
  title: string;
}

export function useISS() {
  const [issData, setIssData] = useState<ISSData | null>(null);

  useEffect(() => {
    const fetchISS = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        setIssData({
          name: 'iss',
          id: data.id,
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude, // kilometers
          velocity: data.velocity, // km/h
          visibility: data.visibility,
          timestamp: data.timestamp,
          type: 'ORBITAL',
          severity: 'low',
          source: 'NASA / NORAD',
          title: 'INTERNATIONAL SPACE STATION'
        });
      } catch (err) {
        console.error('Error fetching ISS data:', err);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 5000); // Poll every 5s since it moves 8km/s

    return () => clearInterval(interval);
  }, []);

  return issData;
}
