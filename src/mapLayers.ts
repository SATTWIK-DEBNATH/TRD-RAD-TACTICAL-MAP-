import { LAYERS, LAYER_CATEGORIES } from './constants';

export interface MapLayerConfig {
  id: string;
  name: string;
  category: keyof typeof LAYER_CATEGORIES;
  color: string;
  icon: string;
  defaultOff?: boolean;
  apiEndpoint?: string;
  refreshInterval?: number;
}

export const MAP_LAYERS_CONFIG: MapLayerConfig[] = LAYERS as MapLayerConfig[];

export const getLayersByCategory = (category: keyof typeof LAYER_CATEGORIES) => {
  return MAP_LAYERS_CONFIG.filter(layer => layer.category === category);
};

export const API_CONFIGS = {
  OPENSKY: {
    url: 'https://opensky-network.org/api/states/all',
    refreshRate: 30000, // 30s
  },
  NOMINATIM: {
    url: 'https://nominatim.openstreetmap.org/reverse',
    params: {
      format: 'jsonv2',
    }
  },
  USGS_EARTHQUAKES: {
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    refreshRate: 60000, // 1m
  },
  NASA_EONET: {
    url: 'https://eonet.gsfc.nasa.gov/api/v3/events',
    refreshRate: 300000, // 5m
  }
};
