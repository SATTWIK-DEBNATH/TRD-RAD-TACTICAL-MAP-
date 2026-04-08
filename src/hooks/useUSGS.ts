import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUSGS = (active: boolean) => {
  const [earthquakes, setEarthquakes] = useState<any[]>([]);

  useEffect(() => {
    if (!active) {
      setEarthquakes([]);
      return;
    }

    const fetchEarthquakes = async () => {
      try {
        const response = await axios.get(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
        );
        
        const events = response.data.features.map((f: any) => ({
          id: f.id,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          title: `EQ: ${f.properties.mag}M - ${f.properties.place}`,
          severity: f.properties.mag >= 5 ? 'critical' : f.properties.mag >= 3 ? 'alert' : 'low',
          time: new Date(f.properties.time).toISOString(),
          type: 'SEISMIC'
        }));
        
        setEarthquakes(events);
      } catch (error) {
        console.error('USGS Fetch Error:', error);
      }
    };

    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [active]);

  return { earthquakes };
};
