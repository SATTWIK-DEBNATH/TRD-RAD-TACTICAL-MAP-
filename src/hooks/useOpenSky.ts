import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Aircraft {
  icao24: string;
  callsign: string;
  origin_country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  velocity: number;
  true_track: number;
  on_ground: boolean;
}

export interface BoundingBox {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export const useOpenSky = (enabled: boolean, region?: BoundingBox) => {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAircraft = async () => {
    if (!enabled) return;
    
    setLoading(true);
    try {
      let url = 'https://opensky-network.org/api/states/all';
      if (region) {
        url += `?lamin=${region.lamin}&lomin=${region.lomin}&lamax=${region.lamax}&lomax=${region.lomax}`;
      }
      
      const response = await axios.get(url);
      
      const states = response.data.states || [];
      const transformed: Aircraft[] = states
        .slice(0, 800) // Increase limit for global/regional flexibility
        .map((s: any) => ({
          icao24: s[0],
          callsign: s[1]?.trim() || 'N/A',
          origin_country: s[2],
          longitude: s[5],
          latitude: s[6],
          baro_altitude: s[7] ? Math.round(s[7] * 3.28084) : 0, // Convert meters to feet
          velocity: s[9] ? Math.round(s[9] * 1.94384) : 0, // Convert m/s to knots
          true_track: s[10],
          on_ground: s[8],
        }))
        .filter((a: Aircraft) => a.longitude && a.latitude);

      setAircraft(transformed);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 429) {
        console.warn('OpenSky Rate Limited');
      } else {
        console.error('OpenSky Fetch Error:', err);
        setError('Failed to fetch aircraft telemetry');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
    const interval = setInterval(fetchAircraft, 15000); // Radar-style update (15s)
    return () => clearInterval(interval);
  }, [enabled, JSON.stringify(region)]);
  const fetchRoute = async (callsign: string) => {
    if (!callsign || callsign === 'N/A') return null;
    try {
      const response = await axios.get(`https://opensky-network.org/api/flights/route?callsign=${callsign}`);
      return response.data;
    } catch {
      // Mock fallback for common callsigns if API is limited for public
      const mocks: Record<string, any> = {
        'DAL': { route: ['JFK', 'LAX'] },
        'UAL': { route: ['ORD', 'SFO'] },
        'AAL': { route: ['DFW', 'MIA'] },
        'BAW': { route: ['LHR', 'JFK'] },
        'UAE': { route: ['DXB', 'JFK'] }
      };
      const prefix = callsign.slice(0, 3);
      return mocks[prefix] || { route: ['DEP', 'ARR'] };
    }
  };

  return { aircraft, loading, error, fetchRoute };
};
