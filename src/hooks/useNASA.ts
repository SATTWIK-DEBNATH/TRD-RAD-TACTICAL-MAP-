import { useState, useEffect } from 'react';
import axios from 'axios';

export const useNASA = (active: boolean) => {
  const [naturalEvents, setNaturalEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!active) {
      setNaturalEvents([]);
      return;
    }

    const fetchNASA = async () => {
      try {
        const response = await axios.get(
          'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20'
        );
        
        const events = response.data.events.map((e: any) => {
          const coord = e.geometry[0].coordinates;
          return {
            id: e.id,
            lat: coord[1],
            lng: coord[0],
            title: `${e.categories[0].title.toUpperCase()}: ${e.title}`,
            severity: 'alert',
            time: e.geometry[0].date,
            type: 'NATURAL'
          };
        });
        
        setNaturalEvents(events);
      } catch (error) {
        console.error('NASA EONET Fetch Error:', error);
      }
    };

    fetchNASA();
    const interval = setInterval(fetchNASA, 300000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, [active]);

  return { naturalEvents };
};
