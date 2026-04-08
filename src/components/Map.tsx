import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLES } from '../constants';

interface MapProps {
  style: string;
  activeLayers: string[];
  aircraft: any[];
  conflicts: any[];
  satellites: any[];
  vessels: any[];
  bases: any[];
  earthquakes: any[];
  naturalEvents: any[];
  iss: any[];
  isr?: any[];
  logistics?: any[];
  center: [number, number];
  zoom: number;
  onDoubleClick: (lng: number, lat: number) => void;
  onMarkerClick?: (item: any) => void;
}

const TacticalMap: React.FC<MapProps> = ({
  style,
  activeLayers,
  aircraft,
  conflicts,
  satellites,
  vessels,
  bases,
  earthquakes,
  naturalEvents,
  iss,
  center,
  zoom,
  onDoubleClick,
  onMarkerClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [airports, setAirports] = React.useState<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    try {
      const activeStyle = Object.values(MAP_STYLES).find(s => s.id === style) || MAP_STYLES.TACTICAL;
      const isRaster = activeStyle.url.includes('{x}') || activeStyle.url.includes('{z}');

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: isRaster ? {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [activeStyle.url],
              tileSize: 256
            }
          },
          layers: [{
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22
          }]
        } : activeStyle.url,
        center: center,
        zoom: zoom,
        pitch: 0,
        doubleClickZoom: false
      });

      map.current.on('dblclick', (e: maplibregl.MapMouseEvent) => {
        onDoubleClick(e.lngLat.lng, e.lngLat.lat);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle Style Changes
  useEffect(() => {
    if (!map.current) return;

    const activeStyle = Object.values(MAP_STYLES).find(s => s.id === style) || MAP_STYLES.TACTICAL;
    const isRaster = activeStyle.url.includes('{x}') || activeStyle.url.includes('{z}');

    if (isRaster) {
      // For raster tiles, we define a basic style object
      map.current.setStyle({
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [activeStyle.url],
            tileSize: 256
          }
        },
        layers: [{
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
          minzoom: 0,
          maxzoom: 22
        }]
      });
    } else {
      // For vector styles
      map.current.setStyle(activeStyle.url);
    }
  }, [style]);

  // Sync camera
  useEffect(() => {
    if (!map.current) return;
    map.current.easeTo({
      center: center,
      zoom: zoom,
      duration: 1000
    });
  }, [center, zoom]);


  useEffect(() => {
    fetch('https://raw.githubusercontent.com/grafana/grafana/main/public/gazetteer/airports.geojson')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.features) return;
        const major = data.features
          .filter((f: any) => f?.properties?.type === 'major' || f?.properties?.type === 'mid')
          .map((f: any) => ({
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
            name: f.properties.name,
            iata: f.properties.iata_code || f.properties.gps_code
          }));
        setAirports(major);
      })
      .catch(err => console.error('Airport GeoJSON load failed:', err));
  }, []);

  // Handle Markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    const addMarkers = (data: any[], color: string, type: string) => {
      try {
        data.forEach((item: any) => {
          const itemLng = item.lng || item.longitude;
          const itemLat = item.lat || item.latitude;
          if (itemLng === undefined || itemLat === undefined) return;
          
          const el = document.createElement('div');
          el.className = `tactical-marker ${type}-marker`;
          if (onMarkerClick) {
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              onMarkerClick(item);
            });
            el.style.cursor = 'pointer';
            el.style.pointerEvents = 'auto';
          }
          
          if (type === 'airports') {
            el.style.color = '#ffffff';
            el.style.opacity = '0.5';
            el.innerHTML = `<svg viewBox="0 0 24 24" width="8" height="8" fill="currentColor"><circle cx="12" cy="12" r="10"></circle></svg>`;
            
            if (map.current && map.current.getZoom() > 6) {
               const label = document.createElement('span');
               label.className = 'absolute top-full left-1/2 -translate-x-1/2 text-[6px] text-white/40 font-mono mt-1 whitespace-nowrap';
               label.innerText = item.iata || '';
               el.appendChild(label);
            }
          } else if (type === 'flights') {
            el.style.color = '#ffde00';
            el.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.5))';
            
            const iconRotation = item.true_track || 0;
            el.innerHTML = `
              <div class="flex flex-col items-center">
                <div style="transform: rotate(${iconRotation}deg); transition: transform 0.5s ease;">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5l8 2.5z"></path>
                  </svg>
                </div>
                <div class="mt-1 bg-black/80 px-1 py-0.5 rounded border border-[#ffde00]/30 flex flex-col items-center min-w-[40px]">
                  <span class="text-[7px] font-black text-[#ffde00] leading-none">${item.callsign}</span>
                  <span class="text-[6px] font-mono text-white/70 leading-none mt-0.5">${Math.round(item.baro_altitude / 100)}'</span>
                </div>
              </div>
            `;
          } else {
            el.style.color = color;
            el.style.filter = `drop-shadow(0 0 5px ${color})`;
            
            let iconPath = '';
            if (type === 'conflicts') iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line>';
            else if (type === 'seismic') iconPath = '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>';
            else if (type === 'iss') iconPath = '<path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 3.5l5.5 5.5H15v6H9v-6H6.5L12 5.5z"/>';
            else iconPath = '<circle cx="12" cy="12" r="3"></circle>';

            el.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
          }
          
          if (map.current) {
            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([itemLng, itemLat])
              .addTo(map.current);
            markers.current.push(marker);
          }
        });
      } catch (err) {
        console.error('Marker addition failure:', err);
      }
    };

    if (activeLayers.includes('airports')) addMarkers(airports, '#ffffff', 'airports');
    if (activeLayers.includes('flights')) addMarkers(aircraft, '#ffde00', 'flights');
    if (activeLayers.includes('conflicts')) addMarkers(conflicts, '#ff4b4b', 'conflicts');
    if (activeLayers.includes('iss') && iss.length > 0) addMarkers(iss, '#ff00ff', 'iss');
    
    // Some legacy layers that don't have toggles but still need rendering if we keep them hardcoded, or ideally map them:
    if (activeLayers.includes('satellites') || satellites.length > 0) addMarkers(satellites, '#39ff14', 'space');
    if (activeLayers.includes('maritime')) addMarkers(vessels, '#00f2ff', 'maritime');
    if (activeLayers.includes('bases')) addMarkers(bases, '#ffcc00', 'bases');
    if (activeLayers.includes('seismic')) addMarkers(earthquakes, '#ffcc00', 'seismic');
    if (activeLayers.includes('natural')) addMarkers(naturalEvents, '#ff4b4b', 'natural');

  }, [airports, aircraft, conflicts, satellites, vessels, bases, earthquakes, naturalEvents, activeLayers, iss]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-black/80 border border-military-border px-3 py-1.5 rounded text-[9px] font-mono z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-military-green rounded-full animate-pulse" />
          <span className="text-military-cyan">CORE_OS: [V3.6_RADAR_SYNC]</span>
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;
