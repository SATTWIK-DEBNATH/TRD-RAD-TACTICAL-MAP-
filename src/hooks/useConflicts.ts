import { useState, useEffect } from 'react';

export interface ConflictEvent {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  date: string;
  source: string;
}


export const useConflicts = (enabled: boolean) => {
  const [events, setEvents] = useState<ConflictEvent[]>([]);
  
  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      return;
    }

    // Since ACLED requires a key, we'll use a curated mock set or GDelt
    // For this demo, let's provide some realistic high-tension markers
    const mockEvents: ConflictEvent[] = [
      {
        id: '1',
        title: 'Cyber Infrastructure Outage',
        description: 'Major internet backbone disruption detected in Eastern Europe.',
        latitude: 50.45,
        longitude: 30.52,
        type: 'CYBER',
        date: new Date().toISOString(),
        source: 'NetBlocks Monitoring'
      },
      {
        id: '2',
        title: 'Naval Maneuvers',
        description: 'Increased maritime activity reported near Taiwan Strait.',
        latitude: 23.5,
        longitude: 119.5,
        type: 'MILITARY',
        date: new Date().toISOString(),
        source: 'AIS Signal Analysis'
      },
      {
        id: '3',
        title: 'Signal Interference',
        description: 'GPS jamming signatures identified in the Baltic region.',
        latitude: 54.7,
        longitude: 20.5,
        type: 'ELECTRONIC',
        date: new Date().toISOString(),
        source: 'ELINT Proxy'
      }
    ];

    setEvents(mockEvents);
  }, [enabled]);

  return { events };
};
