import React, { useState, useMemo, useCallback } from 'react';
import TacticalMap from './components/Map';
import { LAYERS, REGIONS, MAP_STYLES } from './constants';
import * as Icons from 'lucide-react';
import { useOpenSky } from './hooks/useOpenSky';
import { useConflicts } from './hooks/useConflicts';
import { useSpaceLayer } from './hooks/useSpaceLayer';
import { useMaritime } from './hooks/useMaritime';
import { useMilitaryBases } from './hooks/useMilitaryBases';
import { useUSGS } from './hooks/useUSGS';
import { useNASA } from './hooks/useNASA';
import { useISS } from './hooks/useISS';
import { useReverseGeocoding } from './hooks/useReverseGeocoding';
import { useNews } from './hooks/useNews';
import WhatIfSimulator from './components/WhatIfSimulator';
import TacticalSidebar from './components/Sidebar/TacticalSidebar';

const App: React.FC = () => {
  const [mapStyle, setMapStyle] = useState<string>('tactical');
  const [activeLayers, setActiveLayers] = useState<string[]>(
    LAYERS.filter(l => !l.defaultOff).map(l => l.id)
  );
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSimulatorOpen, setSimulatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntel, setSelectedIntel] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 20]);
  const [mapZoom, setMapZoom] = useState(1.5);
  const [timeFilter, setTimeFilter] = useState<number>(24); 
  const [searchMode, setSearchMode] = useState<'tactical' | 'global'>('tactical');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState<any>(null);

  const toggleAISidebar = () => {
    if (!isAISidebarOpen) {
      setSidebarOpen(true);
    }
    setIsAISidebarOpen(!isAISidebarOpen);
  };

  const [isAviationMode, setIsAviationMode] = useState(false);

  const jfkBox = useMemo(() => ({
    lamin: 40.5,
    lomin: -74.0,
    lamax: 40.8,
    lomax: -73.5
  }), []);

  // Data Hooks
  const { aircraft, fetchRoute } = useOpenSky(activeLayers.includes('flights'), isAviationMode ? jfkBox : undefined);
  const { events: conflicts } = useConflicts(activeLayers.includes('conflicts'));
  const { satellites } = useSpaceLayer(activeLayers.includes('space'));
  const { vessels } = useMaritime(activeLayers.includes('maritime'));
  const { bases } = useMilitaryBases(activeLayers.includes('bases'));
  const { earthquakes } = useUSGS(activeLayers.includes('seismic'));
  const { naturalEvents } = useNASA(activeLayers.includes('natural'));
  const issData = useISS();
  const { getAddress } = useReverseGeocoding();
  const news = useNews();

  // Consolidated & Filtered Feed Data
  const globalFeed = useMemo(() => {
    const now = new Date().getTime();
    const filterMs = timeFilter * 60 * 60 * 1000;

    const allData = [
      ...earthquakes,
      ...naturalEvents,
      ...aircraft.map(a => ({ ...a, type: 'AVIATION', severity: 'low', source: 'ADS-B' })),
      ...vessels.map(v => ({ ...v, type: 'MARITIME', severity: 'low', source: 'AIS' })),
      ...conflicts.map(c => ({ ...c, type: 'INTEL', severity: 'critical', source: 'OSINT' }))
    ];

    return allData
      .filter(item => {
        const itemTime = new Date(item.time || item.date).getTime();
        return (now - itemTime) <= filterMs;
      })
      .sort((a, b) => new Date(b.time || b.date).getTime() - new Date(a.time || a.date).getTime());
  }, [earthquakes, naturalEvents, aircraft, vessels, conflicts, timeFilter]);


  const toggleLayer = (id: string) => {
    setActiveLayers((prev: string[]) => 
      prev.includes(id) ? prev.filter((l: string) => l !== id) : [...prev, id]
    );
  };

  const handleRegionJump = (region: typeof REGIONS[0]) => {
    setMapCenter(region.center as [number, number]);
    setMapZoom(region.zoom);
    if (region.name.includes('JFK')) {
      setIsAviationMode(true);
      setActiveLayers(prev => prev.includes('flights') ? prev : [...prev, 'flights']);
    } else {
      setIsAviationMode(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    if (searchMode === 'global') {
      // Simulate Global AI Search Result
      const mockResult = {
        query: searchQuery,
        summary: `SENTRY Intelligence suggests ${searchQuery} is a strategic point of interest in current geopolitical context. Cross-referencing Google Search indices and ELINT signals... Result indicates high probability of significance.`,
        results: [
          { title: `${searchQuery} - Official Intelligence Group`, url: `https://intel.gov/p/${searchQuery}`, snippet: `Historical data and strategic overview of ${searchQuery} assets.` },
          { title: `Real-time Monitoring of ${searchQuery}`, url: "#", snippet: "Satellite telemetry indicates recent positional shifts and encrypted traffic spikes." },
          { title: `${searchQuery} // Global Impact Analysis`, url: "#", snippet: "Economic and cyber fallout projections for this sector." }
        ]
      };
      setGlobalSearchResults(mockResult);
      return;
    }

    setGlobalSearchResults(null);
    // Check if search is coordinates (lat, lng)
    const coordMatch = searchQuery.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setMapCenter([lng, lat]);
      setMapZoom(10);
      handleMapDoubleClick(lng, lat);
      return;
    }

    setSelectedIntel({
      title: `Search: ${searchQuery}`,
      description: `Analyzing intelligence data for "${searchQuery}"... Dynamic correlation shows elevated interest.`,
      type: 'SEARCH',
      time: new Date().toISOString()
    });
  };

  const handleMapDoubleClick = useCallback(async (lng: number, lat: number) => {
    const locationInfo = await getAddress(lat, lng);
    
    setSelectedIntel({
      title: `COORDINATE INTEL`,
      location: locationInfo?.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
      description: `LAT: ${lat.toFixed(4)} | LON: ${lng.toFixed(4)}\nRegion: ${locationInfo?.address?.country || '[REDACTED]'}\nStatus: ANALYSIS_REQUIRED`,
      type: 'COORD',
      lat,
      lng,
      externalLinks: {
        googleMaps: `https://www.google.com/maps/@${lat},${lng},15z`,
        satellite: `https://www.google.com/maps/@${lat},${lng},15z/data=!3m1!1e3`,
        streetView: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
      },
      time: new Date().toISOString()
    });
  }, [getAddress]);

  const handleMarkerClick = useCallback((item: any) => {
    let title = item.title || item.name || item.callsign || 'Target Selected';
    let type = item.type || 'UNKNOWN';
    let severity = item.severity || 'low';
    let source = item.source || 'SYSTEM';

    if (item.icao24 || item.callsign) {
       title = `FLIGHT: ${item.callsign || item.icao24}`;
       type = 'AVIATION';
       source = 'ADS-B';
    } else if (item.mmsi || item.vessel_name) {
       type = 'MARITIME';
       source = 'AIS';
    }

    const intelData = {
      ...item,
      title,
      type,
      severity,
      source,
      time: item.time || item.date || new Date().toISOString(),
      lat: item.lat || item.latitude,
      lng: item.lng || item.longitude
    };
    
    setSelectedIntel(intelData);
    if (!isSidebarOpen) setSidebarOpen(true);
    
    if (intelData.lng && intelData.lat) {
       setMapCenter([intelData.lng, intelData.lat]);
       setMapZoom(type === 'AVIATION' ? 8 : 10);
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-[#00f2ff] selection:bg-[#00f2ff]/30 bg-black relative">
      <div className="scan-line" />
      <div className="crt-grid" />
      
      {/* Top Bar */}
      <header className="h-16 glass-panel mx-4 mt-4 flex items-center justify-between px-6 z-50 rounded-b-none border-b-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-military-green animate-pulse rounded-full shadow-[0_0_8px_#39ff14]" />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">
              World Monitor <span className="text-white/40 font-mono text-[10px] align-top ml-1">v2.0</span>
            </h1>
          </div>
          
          {/* Regional Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded border border-military-border">
            {REGIONS.map(region => (
              <button
                key={region.name}
                onClick={() => handleRegionJump(region)}
                className="px-3 py-1 text-[9px] font-bold text-gray-400 hover:text-military-cyan transition-colors"
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 max-w-lg mx-8 flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-black/40 rounded border border-military-border p-0.5">
            <button 
              onClick={() => setSearchMode('tactical')}
              className={`px-2 py-1 text-[7px] font-black uppercase transition-all ${searchMode === 'tactical' ? 'bg-military-cyan text-black' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Tactical
            </button>
            <button 
              onClick={() => setSearchMode('global')}
              className={`px-2 py-1 text-[7px] font-black uppercase transition-all ${searchMode === 'global' ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Global
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Icons.Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchMode === 'global' ? 'text-red-500' : 'text-gray-500 group-focus-within:text-military-cyan'}`} size={12} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchMode === 'global' ? "Sentry Global Intelligence Search..." : "Search coordinates, units, intel..."}
              className={`w-full bg-black/60 border border-military-border rounded py-1.5 pl-10 pr-4 text-[10px] focus:outline-none transition-all shadow-inner ${searchMode === 'global' ? 'text-red-400 border-red-900/50 focus:border-red-500' : 'text-military-cyan focus:border-military-cyan/50'}`}
            />
            {searchMode === 'global' && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150" />
            </div>}
          </form>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              setIsAviationMode(!isAviationMode);
              if (!activeLayers.includes('flights')) {
                setActiveLayers(prev => [...prev, 'flights']);
              }
            }}
            className={`p-2 rounded border transition-all ${isAviationMode ? 'bg-[#ffde00]/20 border-[#ffde00] text-[#ffde00] shadow-[0_0_10px_#ffde00]' : 'border-military-border text-gray-500 hover:text-[#ffde00]'}`}
            title="Live Aviation Radar (FR24 Mode)"
          >
            <Icons.Plane size={16} />
          </button>

          {/* Time Filter */}
          <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded border border-military-border">
            <span className="text-[8px] font-black text-gray-500 uppercase">Window</span>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(parseInt(e.target.value))}
              className="bg-transparent text-[10px] font-bold text-military-cyan outline-none cursor-pointer"
            >
              <option value="1" className="bg-black">1H</option>
              <option value="6" className="bg-black">6H</option>
              <option value="12" className="bg-black">12H</option>
              <option value="24" className="bg-black">24H</option>
              <option value="48" className="bg-black">48H</option>
              <option value="168" className="bg-black">1W</option>
            </select>
          </div>

          <button 
            onClick={() => setSimulatorOpen(!isSimulatorOpen)}
            className={`p-2 rounded border transition-all ${isSimulatorOpen ? 'bg-military-green/20 border-military-green text-military-green' : 'border-military-border text-gray-500 hover:text-military-cyan'}`}
            title="Scenario Simulator"
          >
            <Icons.Zap size={16} />
          </button>
          <button 
            onClick={toggleAISidebar}
            className={`p-2 rounded border transition-all ${isAISidebarOpen ? 'bg-military-cyan/20 border-military-cyan text-military-cyan shadow-[0_0_10px_#00f2ff]' : 'border-military-border text-gray-500 hover:text-white'}`}
            title="AI Command Center"
          >
            <Icons.MoreVertical size={16} />
          </button>

        <div className="flex gap-1 bg-black/40 p-1 rounded-sm border border-military-border">
          {Object.values(MAP_STYLES).map(s => (
            <button
              key={s.id}
              onClick={() => setMapStyle(s.id)}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${mapStyle === s.id ? 'bg-military-cyan text-black shadow-[0_0_10px_#00f2ff]' : 'text-gray-500 hover:text-military-cyan'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
          
          <div className="flex flex-col items-end min-w-[80px]">
            <span className="hud-text text-gray-500 text-[8px]">System Time</span>
            <span className="text-xs font-black tabular-nums">
              {new Date().toISOString().split('T')[1].slice(0, 8)} Z
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        {!isSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="absolute left-6 top-6 z-[45] glass-panel p-2 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <Icons.ChevronRight size={18} />
          </button>
        )}

        {isSidebarOpen && (
          <div className="relative z-40 h-full">
            <TacticalSidebar 
              activeLayers={activeLayers}
              toggleLayer={toggleLayer}
              layers={LAYERS}
              feedData={globalFeed}
              selectedEntity={selectedIntel}
              onSelectEntity={(e) => {
                setSelectedIntel(e);
                if (e.lng && e.lat) {
                  setMapCenter([e.lng, e.lat]);
                  setMapZoom(10);
                }
              }}
              forcedTab={isAISidebarOpen ? 'ai' : undefined}
              fetchFlightRoute={fetchRoute}
              onClose={() => setSidebarOpen(false)}
              news={news}
            />
          </div>
        )}

        {/* Map */}
        <div className="absolute inset-0">
          <TacticalMap 
            style={mapStyle}
            activeLayers={activeLayers}
            aircraft={aircraft} 
            conflicts={conflicts} 
            satellites={satellites}
            vessels={vessels}
            bases={bases}
            earthquakes={earthquakes}
            naturalEvents={naturalEvents}
            iss={issData ? [issData] : []}
            center={mapCenter}
            zoom={mapZoom}
            onDoubleClick={handleMapDoubleClick}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* AI Brief Bar (Bottom) */}
        {isSimulatorOpen && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="pointer-events-auto">
              <WhatIfSimulator onClose={() => setSimulatorOpen(false)} />
            </div>
          </div>
        )}

        {/* DEFCON / Status Bar */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex gap-4">
          <div className="px-5 py-1.5 bg-military-critical/10 border border-military-critical/30 rounded-full backdrop-blur-md flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-military-critical rounded-full animate-ping" />
            <span className="text-[10px] font-black text-military-critical tracking-tighter uppercase whitespace-nowrap">
              DEFCON 3 // Elevated Global Tension
            </span>
          </div>
          <div className="px-5 py-1.5 bg-military-alert/10 border border-military-alert/30 rounded-full backdrop-blur-md flex items-center gap-3">
            <Icons.Activity size={12} className="text-military-alert animate-bounce" />
            <span className="text-[10px] font-black text-military-alert tracking-tighter uppercase whitespace-nowrap">
              {earthquakes.length > 0 ? `SEISMIC ALERT: ${earthquakes[0]?.title.slice(0, 20)}...` : 'Environmental: NORMAL'}
            </span>
          </div>
        </div>
        {/* Global Search Results Layer */}
        {globalSearchResults && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[45] w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="glass-panel p-6 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-red-500 font-black text-sm uppercase tracking-widest italic">Sentry Global Intelligence // Google Search</h3>
                  <p className="text-[10px] text-gray-500 font-mono italic">Results for: "{globalSearchResults.query}"</p>
                </div>
                <button onClick={() => setGlobalSearchResults(null)} className="text-gray-500 hover:text-white"><Icons.X size={18} /></button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Brain size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-red-500 uppercase">AI Analyst Summary</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed italic">{globalSearchResults.summary}</p>
                </div>

                <div className="space-y-3">
                  {globalSearchResults.results.map((res: any, idx: number) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Icons.Globe size={10} className="text-blue-400" />
                        <h4 className="text-[11px] font-bold text-blue-400 group-hover:underline">{res.title}</h4>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2">{res.snippet}</p>
                      <span className="text-[9px] text-gray-600 block mt-1">{res.url}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-military-border flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span className="text-[8px] font-black text-gray-700 uppercase italic">End of Google Index Page 1</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-grid-pattern [background-size:40px_40px] z-[100]" />
    </div>
  );
};

export default App;

