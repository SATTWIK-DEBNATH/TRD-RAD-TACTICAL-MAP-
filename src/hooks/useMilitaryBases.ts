import { useState, useEffect } from 'react';

export interface MilitaryBase {
  id: string;
  name: string;
  country: string;
  type: string;
  latitude: number;
  longitude: number;
}

export const useMilitaryBases = (enabled: boolean) => {
  const [bases, setBases] = useState<MilitaryBase[]>([]);

  useEffect(() => {
    if (!enabled) {
      setBases([]);
      return;
    }

    const mockBases: MilitaryBase[] = [
      { id: '1', name: 'Ramstein Air Base', country: 'Germany', type: 'AIR', latitude: 49.4, longitude: 7.6 },
      { id: '2', name: 'Yokosuka Naval Base', country: 'Japan', type: 'NAVAL', latitude: 35.3, longitude: 139.7 },
      { id: '3', name: 'Incirlik Air Base', country: 'Turkey', type: 'AIR', latitude: 37.0, longitude: 35.4 },
      { id: '4', name: 'Diego Garcia', country: 'UK/US', type: 'SUPPORT', latitude: -7.3, longitude: 72.4 },
      { id: '5', name: 'Fort Bragg', country: 'USA', type: 'ARMY', latitude: 35.1, longitude: -78.9 },
      { id: '6', name: 'Hmeymim Air Base', country: 'Russia/Syria', type: 'AIR', latitude: 35.4, longitude: 35.9 },
    ];

    setBases(mockBases);
  }, [enabled]);

  return { bases };
};
