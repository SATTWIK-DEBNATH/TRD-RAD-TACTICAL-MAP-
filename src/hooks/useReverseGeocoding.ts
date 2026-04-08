import { useState, useCallback } from 'react';
import axios from 'axios';

export interface LocationDetails {
  display_name: string;
  address: {
    city?: string;
    country?: string;
    state?: string;
    suburb?: string;
    road?: string;
  };
}

export const useReverseGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAddress = useCallback(async (lat: number, lng: number): Promise<LocationDetails | null> => {
    setLoading(true);
    setError(null);
    try {
      // Nominatim API usage policy: 1 request per second, provide User-Agent
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'jsonv2',
        },
        headers: {
          'User-Agent': 'WorldMonitorDashboard/2.0'
        }
      });
      
      setLoading(false);
      return response.data as LocationDetails;
    } catch (err) {
      console.error('Reverse Geocoding Error:', err);
      setError('Failed to fetch location details');
      setLoading(false);
      return null;
    }
  }, []);

  return { getAddress, loading, error };
};
