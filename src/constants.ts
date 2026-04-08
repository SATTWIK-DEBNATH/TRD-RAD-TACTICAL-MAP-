export const MAP_STYLES = {
  TACTICAL: {
    id: 'tactical',
    name: 'Tactical Dark',
    url: `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json${import.meta.env.VITE_STADIA_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_API_KEY}` : ''}`
  },
  SATELLITE: {
    id: 'satellite',
    name: 'High-Res Satellite',
    url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  },
  TERRAIN: {
    id: 'terrain',
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  },
  HYBRID: {
    id: 'hybrid',
    name: 'Satellite Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
  }
};

export const SATELLITE_FALLBACK = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';


export const LAYER_CATEGORIES = {
  AEROSPACE: 'Orbital & Aerospace',
  MILITARY: 'Military Operations',
  INTEL: 'Intelligence & OSINT',
  INFRA: 'Critical Infrastructure',
  ENV: 'Environmental Hazards',
  LOGISTICS: 'Supply Chain & Logistics',
  SUPPORT: 'Support & Advanced Ops'
};

export const LAYERS = [
  // Aerospace
  { id: 'iss', name: 'Live ISS Tracker', category: 'AEROSPACE', color: '#ff00ff', icon: 'Satellite', defaultOff: false },
  { id: 'flights', name: 'ADS-B Aircraft (Live)', category: 'AEROSPACE', color: '#ffde00', icon: 'Plane', defaultOff: false },
  { id: 'airports', name: 'Major Airports', category: 'AEROSPACE', color: '#ffffff', icon: 'Warehouse', defaultOff: true },
  { id: 'isr', name: 'Live ISR Fusion', category: 'SUPPORT', color: '#00ffff', icon: 'Satellite', defaultOff: true },
  // Military
  { id: 'bases', name: 'Military Installations', category: 'MILITARY', color: '#ffde00', icon: 'ShieldHighlight' },
  { id: 'naval', name: 'Naval Deployments', category: 'MILITARY', color: '#39ff14', icon: 'Anchor' },
  { id: 'nuclear', name: 'Nuclear Facilities', category: 'MILITARY', color: '#00ff41', icon: 'Zap' },
  // Intelligence
  { id: 'conflicts', name: 'Active Conflicts', icon: 'Crosshair', category: 'INTEL', color: '#ff4b4b' },
  { id: 'sigint', name: 'SIGINT Hotspots', category: 'INTEL', color: '#a855f7', icon: 'Radio' },
  { id: 'cyber', name: 'Cyber Activity', category: 'INTEL', color: '#00f2ff', icon: 'Cpu' },
  { id: 'jamming', name: 'GPS Jamming', category: 'INTEL', color: '#ff00ff', icon: 'WifiOff' },
  { id: 'osint', name: 'OSINT Feed', category: 'INTEL', color: '#ffffff', icon: 'Search' },
  // Infrastructure
  { id: 'power', name: 'Energy Grid', category: 'INFRA', color: '#ffce00', icon: 'Zap' },
  { id: 'waterways', name: 'Strategic Waterways', category: 'INFRA', color: '#0077be', icon: 'Waves' },
  { id: 'ports', name: 'Global Ports', category: 'INFRA', color: '#00ff00', icon: 'Container' },
  // Environmental
  { id: 'seismic', name: 'Seismic Activity', category: 'ENV', color: '#ffcc00', icon: 'Activity' },
  { id: 'natural', name: 'Natural Disaster', category: 'ENV', color: '#ff4b4b', icon: 'Flame' },
  { id: 'weather', name: 'Weather Patterns', category: 'ENV', color: '#ffffff', icon: 'Cloud' },
  // Logistics
  { id: 'maritime', name: 'AIS Vessels (Live)', category: 'LOGISTICS', color: '#39ff14', icon: 'Ship' },
  { id: 'logistics', name: 'Logistics Heatmap', category: 'SUPPORT', color: '#ff8800', icon: 'Truck', defaultOff: true },
  { id: 'news', name: 'Surface News Feed', category: 'SUPPORT', color: '#ffffff', icon: 'Newspaper', defaultOff: false },
];

export const REGIONS = [
  { name: 'GLOBAL', center: [0, 20], zoom: 1.5 },
  { name: 'HUB: JFK', center: [-73.7781, 40.6413], zoom: 12 },
  { name: 'AMERICAS', center: [-95, 37], zoom: 3 },
  { name: 'EUROPE', center: [15, 50], zoom: 4 },
  { name: 'MENA', center: [35, 25], zoom: 4 },
  { name: 'ASIA', center: [100, 30], zoom: 3 },
  { name: 'AFRICA', center: [20, 0], zoom: 3 },
  { name: 'OCEANIA', center: [135, -25], zoom: 3 },
  { name: 'ARCTIC', center: [0, 90], zoom: 2 }
];

export const INTEL_SOURCES = {
  OSINT: { label: 'OSINT', color: '#ffffff', description: 'Open Source Intelligence' },
  SIGINT: { label: 'SIGINT', color: '#a855f7', description: 'Signals Intelligence' },
  HUMINT: { label: 'HUMINT', color: '#ffde00', description: 'Human Intelligence' },
  GEOINT: { label: 'GEOINT', color: '#39ff14', description: 'Geospatial Intelligence' },
  ELINT: { label: 'ELINT', color: '#00f2ff', description: 'Electronic Intelligence' }
};

