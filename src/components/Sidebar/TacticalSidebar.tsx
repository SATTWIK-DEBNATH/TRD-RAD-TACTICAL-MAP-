import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { INTEL_SOURCES, LAYER_CATEGORIES } from '../../constants';

interface TacticalSidebarProps {
  activeLayers: string[];
  toggleLayer: (id: string) => void;
  layers: any[];
  feedData: any[];
  selectedEntity: any;
  onSelectEntity: (entity: any) => void;
  forcedTab?: 'feed' | 'details' | 'legend' | 'ai';
  fetchFlightRoute?: (callsign: string) => Promise<any>;
  onClose?: () => void;
  news?: any;
}

const TacticalSidebar: React.FC<TacticalSidebarProps> = ({ 
  activeLayers, 
  toggleLayer, 
  layers, 
  feedData,
  selectedEntity,
  onSelectEntity,
  forcedTab,
  fetchFlightRoute,
  onClose,
  news
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'details' | 'legend' | 'ai' | 'news'>('feed');
  const [flightRoute, setFlightRoute] = useState<any>(null);

  React.useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  React.useEffect(() => {
    const getRoute = async () => {
      if (selectedEntity?.type === 'AVIATION' && selectedEntity.callsign && fetchFlightRoute) {
        const route = await fetchFlightRoute(selectedEntity.callsign);
        setFlightRoute(route);
      } else {
        setFlightRoute(null);
      }
    };
    getRoute();
  }, [selectedEntity, fetchFlightRoute]);

  return (
    <aside className="glass-panel absolute left-4 top-4 bottom-4 w-80 z-40 transition-all duration-500 flex flex-col pointer-events-auto shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      {/* Tabs */}
      <div className="flex border-b border-military-border bg-black/40 pr-2">
        {(['feed', 'details', 'news', 'legend', 'ai'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-1 ${activeTab === tab ? 'text-military-cyan bg-military-cyan/10 border-b-2 border-military-cyan' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab === 'ai' ? <Icons.Brain size={12} className={activeTab === 'ai' ? 'animate-pulse' : ''} /> : 
             tab === 'news' ? <Icons.Newspaper size={12} /> : null}
            {tab}
          </button>
        ))}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center px-3 text-gray-500 hover:text-military-cyan hover:bg-military-cyan/10 transition-colors border-l border-military-border"
          >
            <Icons.Minimize2 size={12} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'feed' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 military-scroll">
            <div className="flex justify-between items-center mb-4 border-b border-military-border pb-2">
              <span className="hud-text text-gray-500">Live Telemetry Feed</span>
              <span className="text-[10px] text-military-cyan animate-pulse">{feedData.length} ACTIVE</span>
            </div>
            {feedData.map((item, i) => {
              const source = (INTEL_SOURCES as any)[item.source] || { label: item.source || 'UNK', color: '#666' };
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    onSelectEntity(item);
                    setActiveTab('details');
                  }}
                  className={`p-3 border-l-2 bg-white/5 hover:bg-white/10 cursor-pointer transition-all ${item.severity === 'critical' ? 'border-military-critical' : item.severity === 'alert' ? 'border-military-alert' : 'border-military-cyan/30'}`}
                >
                  <div className="flex justify-between items-center text-[8px] mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`${item.severity === 'critical' ? 'text-military-critical' : item.severity === 'alert' ? 'text-military-alert' : 'text-military-cyan'} font-black`}>
                        {item.type}
                      </span>
                      <span className="text-gray-600">|</span>
                      <span style={{ color: source.color }} className="font-bold border border-current px-1 rounded-[2px] opacity-70">
                        {source.label}
                      </span>
                    </div>
                    <span className="text-gray-500 font-mono italic">{new Date(item.time || item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-gray-300 line-clamp-2 leading-snug">{item.title}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 military-scroll">
            {selectedEntity ? (
              selectedEntity.type === 'AVIATION' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 pb-6">
                  {/* Wireframe Airplane header */}
                  <div className="relative w-full h-32 bg-black/60 border border-military-cyan/30 rounded overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
                    <Icons.Plane size={84} strokeWidth={1} className="text-military-cyan/10 absolute -rotate-45 scale-[1.5]" />
                    <div className="relative z-10 text-center space-y-1">
                      <h2 className="text-2xl font-black text-white tracking-widest">{selectedEntity.callsign || selectedEntity.icao24}</h2>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-military-cyan font-bold uppercase tracking-tight">
                        <span>{selectedEntity.origin_country || 'UNKNOWN AL'}</span>
                        <span className="w-1 h-1 rounded-full bg-military-cyan" />
                        <span>AIRCRAFT: {selectedEntity.icao24?.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded border border-[#ffde00]/50 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-[#ffde00] rounded-full animate-pulse shadow-[0_0_5px_#ffde00]" />
                      <span className="text-[8px] font-black text-[#ffde00] uppercase tracking-widest">Live ADS-B</span>
                    </div>
                  </div>

                  {/* Route visualization */}
                  <div className="p-4 bg-military-cyan/5 border border-military-cyan/20 rounded space-y-4 relative">
                     <span className="text-[7px] hud-text text-military-cyan absolute top-2 left-2">ROUTE LOGISTICS</span>
                     <div className="flex justify-between items-end pt-3 text-center">
                       <div className="w-16">
                         <div className="text-3xl font-black text-white tracking-tighter">{flightRoute?.route?.[0] || 'N/A'}</div>
                         <div className="text-[8px] text-gray-500 uppercase font-black">Departure</div>
                       </div>
                       <div className="flex-1 px-2 flex flex-col items-center justify-center pb-2 relative">
                         <div className="w-full h-px bg-gradient-to-r from-military-cyan/10 via-military-cyan/50 to-military-cyan/10" />
                         <Icons.Plane size={12} className="text-military-cyan absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                       <div className="w-16">
                         <div className="text-3xl font-black text-gray-400 tracking-tighter">{flightRoute?.route?.[1] || 'N/A'}</div>
                         <div className="text-[8px] text-gray-500 uppercase font-black">Arrival</div>
                       </div>
                     </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1 group">
                      <span className="hud-text text-gray-500 text-[8px] group-hover:text-military-cyan transition-colors">ALTITUDE (BARO)</span>
                      <div className="text-lg font-mono text-military-cyan flex items-end gap-1">
                        {(selectedEntity.baro_altitude || 0).toLocaleString()} <span className="text-[9px] mb-1 font-sans font-bold text-gray-500">FT</span>
                      </div>
                      <div className="w-full h-1 bg-gray-900 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-military-cyan/50 to-military-cyan" style={{ width: `${Math.min((selectedEntity.baro_altitude || 0) / 40000 * 100, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1 group">
                      <span className="hud-text text-gray-500 text-[8px] group-hover:text-[#ffde00] transition-colors">GROUND SPEED</span>
                      <div className="text-lg font-mono text-[#ffde00] flex items-end gap-1">
                        {(selectedEntity.velocity || 0).toLocaleString()} <span className="text-[9px] mb-1 font-sans font-bold text-gray-500">KTS</span>
                      </div>
                      <div className="w-full h-1 bg-gray-900 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#ffde00]/50 to-[#ffde00]" style={{ width: `${Math.min((selectedEntity.velocity || 0) / 600 * 100, 100)}%` }} />
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1">
                      <span className="hud-text text-gray-500 text-[8px]">TRUE TRACK</span>
                      <div className="text-lg font-mono text-white flex items-center gap-2">
                        {Math.round(selectedEntity.true_track || 0)}°
                        {selectedEntity.true_track !== undefined && (
                          <Icons.Navigation size={12} className="text-military-cyan" style={{ transform: `rotate(${selectedEntity.true_track}deg)` }} />
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1">
                      <span className="hud-text text-gray-500 text-[8px]">LAT / LNG</span>
                      <div className="text-[10px] font-mono text-gray-400">
                        {selectedEntity.lat?.toFixed(4)},<br/>{selectedEntity.lng?.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  {/* Map Link */}
                  <div className="pt-2 border-t border-military-border/30">
                    <a 
                      href={`https://www.flightradar24.com/${selectedEntity.lat},${selectedEntity.lng}/8`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#ffde00]/5 hover:bg-[#ffde00]/10 text-[#ffde00] border border-[#ffde00]/30 rounded text-[9px] font-black uppercase transition-all group"
                    >
                      <Icons.ExternalLink size={12} className="group-hover:scale-110 transition-transform" /> Access Flightradar24 Feed
                    </a>
                  </div>
                </div>
              ) : selectedEntity.type === 'ORBITAL' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 pb-6">
                  <div className="relative w-full h-32 bg-black/60 border border-[#ff00ff]/30 rounded overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff00ff]/10 via-black to-black pointer-events-none" />
                    <Icons.Satellite size={84} strokeWidth={1} className="text-[#ff00ff]/20 absolute" />
                    <div className="relative z-10 text-center space-y-1">
                      <h2 className="text-2xl font-black text-white tracking-widest">{selectedEntity.title || 'UNKNOWN SATELLITE'}</h2>
                      <div className="flex items-center justify-center gap-2 text-[10px] text-[#ff00ff] font-bold uppercase tracking-tight">
                        <span>{selectedEntity.source || 'NORAD TIMETABLE'}</span>
                        <span className="w-1 h-1 rounded-full bg-[#ff00ff]" />
                        <span>ORBIT: LEO</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded border border-[#ff00ff]/50 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-[#ff00ff] rounded-full animate-pulse shadow-[0_0_5px_#ff00ff]" />
                      <span className="text-[8px] font-black text-[#ff00ff] uppercase tracking-widest">LIVE TRACK</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1 group">
                      <span className="hud-text text-gray-500 text-[8px] group-hover:text-[#ff00ff] transition-colors">ALTITUDE</span>
                      <div className="text-lg font-mono text-[#ff00ff] flex items-end gap-1">
                        {(selectedEntity.altitude || 0).toLocaleString(undefined, {maximumFractionDigits: 1})} <span className="text-[9px] mb-1 font-sans font-bold text-gray-500">KM</span>
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1 group">
                      <span className="hud-text text-gray-500 text-[8px] group-hover:text-[#ff00ff] transition-colors">VELOCITY</span>
                      <div className="text-lg font-mono text-[#ff00ff] flex items-end gap-1">
                        {(selectedEntity.velocity || 0).toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-[9px] mb-1 font-sans font-bold text-gray-500">KM/H</span>
                      </div>
                    </div>
                    <div className="p-3 bg-black/40 border border-military-border/30 rounded space-y-1 col-span-2">
                      <span className="hud-text text-gray-500 text-[8px]">SUB-SATELLITE POINT (LAT / LNG)</span>
                      <div className="text-sm font-mono text-gray-300">
                        {selectedEntity.lat?.toFixed(4)}, {selectedEntity.lng?.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-military-border/30">
                    <a 
                      href={`https://isstracker.pl/en`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff00ff]/5 hover:bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30 rounded text-[9px] font-black uppercase transition-all group"
                    >
                      <Icons.ExternalLink size={12} className="group-hover:scale-110 transition-transform" /> View Public Tracker
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300 pb-6">
                  <div className="p-3 bg-military-cyan/5 border border-military-cyan/20 rounded-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xs font-black text-military-cyan uppercase tracking-tighter italic">Intelligence Report // {selectedEntity.type}</h3>
                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase ${selectedEntity.severity === 'critical' ? 'bg-military-critical/20 text-military-critical border border-military-critical/30' : 'bg-military-alert/20 text-military-alert border border-military-alert/30'}`}>
                        {selectedEntity.severity || 'LOW'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-200 font-bold leading-tight mb-2">{selectedEntity.title}</p>
                    {selectedEntity.location && (
                      <div className="flex items-start gap-1.5 pt-2 border-t border-military-border/50">
                        <Icons.MapPin size={10} className="text-gray-500 mt-0.5 shrink-0" />
                        <span className="text-[9px] text-gray-400 italic leading-tight">{selectedEntity.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-black/40 border border-military-border/30 rounded-sm">
                      <span className="hud-text text-gray-500 block mb-1">LATITUDE</span>
                      <div className="text-[11px] font-mono tabular-nums">{selectedEntity.lat?.toFixed(5)}</div>
                    </div>
                    <div className="p-2 bg-black/40 border border-military-border/30 rounded-sm">
                      <span className="hud-text text-gray-500 block mb-1">LONGITUDE</span>
                      <div className="text-[11px] font-mono tabular-nums">{selectedEntity.lng?.toFixed(5)}</div>
                    </div>
                  </div>

                  <div className="space-y-1 p-2 bg-black/20 border border-military-border/20 rounded-sm">
                    <span className="hud-text text-gray-500 block">SOURCE CLASSIFICATION</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white px-1.5 bg-military-cyan/20 rounded">{(INTEL_SOURCES as any)[selectedEntity.source]?.label || 'UNSPECIFIED'}</span>
                      <span className="text-[9px] text-gray-500 italic">{(INTEL_SOURCES as any)[selectedEntity.source]?.description || ''}</span>
                    </div>
                  </div>

                  {selectedEntity.externalLinks && (
                    <div className="space-y-4 pt-2 border-t border-military-border/50">
                      <div className="flex justify-between items-center">
                        <span className="hud-text text-gray-500">Visual Recon Mode</span>
                        <div className="flex gap-2">
                          <Icons.Satellite size={10} className="text-military-cyan" />
                          <Icons.Camera size={10} className="text-military-cyan" />
                        </div>
                      </div>
                      
                      <div className="relative aspect-video w-full bg-black rounded overflow-hidden border border-military-border group">
                        <iframe 
                          title="Satellite Recon"
                          width="100%" 
                          height="100%" 
                          style={{ border: 0, opacity: 0.7, filter: 'invert(1) hue-rotate(180deg) contrast(1.5) grayscale(0.8)' }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedEntity.lng - 0.02}%2C${selectedEntity.lat - 0.02}%2C${selectedEntity.lng + 0.02}%2C${selectedEntity.lat + 0.02}&layer=mapnik&marker=${selectedEntity.lat}%2C${selectedEntity.lng}`}
                          allowFullScreen
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none border border-military-cyan/20 group-hover:border-military-cyan/40 transition-all"></div>
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[7px] font-black text-military-cyan uppercase backdrop-blur-sm border border-military-cyan/30">
                          Live Satellite Feed
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a 
                          href={selectedEntity.externalLinks.googleMaps} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-1.5 bg-gray-800/50 hover:bg-military-cyan/10 rounded text-[8px] font-bold uppercase transition-all border border-white/5"
                        >
                          <Icons.ExternalLink size={10} /> Full Map
                        </a>
                        <a 
                          href={selectedEntity.externalLinks.streetView} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-1.5 bg-military-cyan/10 hover:bg-military-cyan/20 border border-military-cyan/30 text-military-cyan rounded text-[8px] font-bold uppercase transition-all"
                        >
                          <Icons.Eye size={10} /> Street View
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-white/5 rounded-sm space-y-2">
                     <div className="flex justify-between items-center">
                      <span className="hud-text text-gray-500">ANALYSIS CONFIDENCE</span>
                      <span className="text-[9px] font-black text-military-cyan">88%</span>
                    </div>
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-military-cyan/50 to-military-cyan" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 mt-20">
                <Icons.Target size={48} className="text-military-cyan animate-pulse" />
                <p className="text-[10px] uppercase tracking-widest leading-loose">
                  Select an entity for<br/>
                  <span className="text-military-cyan font-black">Deep Intelligence</span><br/>
                  analysis
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-military-border pb-2">
              <div className="flex items-center gap-2">
                <Icons.Brain size={14} className="text-military-cyan" />
                <span className="hud-text text-military-cyan font-black">SENTRY AI CONSULTANT</span>
              </div>
              <span className="text-[8px] bg-military-cyan/20 px-1 border border-military-cyan/30 text-military-cyan rounded">ONLINE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 military-scroll pr-1 pb-4">
              <div className="bg-military-cyan/5 border border-military-border p-3 rounded-sm space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-military-cyan uppercase">
                  <span>Live Aviation Intel</span>
                  <Icons.Plane size={12} className="animate-pulse" />
                </div>
                <p className="text-[8px] text-gray-500 italic pb-1">Precision 15s Radar polling // ADS-B Stream</p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => onSelectEntity({ type: 'HUB', title: 'JFK AIRPORT', lat: 40.6413, lng: -73.7781, externalLinks: { googleMaps: 'https://www.google.com/maps/@40.6413,-73.7781,15z' } })}
                     className="flex-1 py-1.5 bg-military-cyan/10 hover:bg-military-cyan/20 border border-military-cyan/30 text-military-cyan text-[8px] font-black uppercase rounded"
                   >
                     Focus JFK Hub
                   </button>
                   <button 
                     className="px-3 py-1.5 bg-gray-800 text-gray-400 text-[8px] font-black uppercase rounded border border-white/5"
                   >
                     Radar View
                   </button>
                </div>
              </div>

              <div className="bg-military-cyan/5 border border-military-cyan/20 p-3 rounded-sm">
                <p className="text-[10px] text-military-cyan font-bold mb-1">// INITIALIZATION COMPLETE</p>
                <p className="text-[9px] text-gray-400 leading-relaxed italic">
                  I am SENTRY, your tactical intelligence analysis engine. I have full access to global telemetry, historical conflict data, and real-time Google search indices.
                </p>
              </div>

              <div className="space-y-3">
                 <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-military-cyan flex items-center justify-center shrink-0">
                      <Icons.Cpu size={10} className="text-black" />
                    </div>
                    <div className="bg-black/60 border border-military-border p-2 rounded-sm text-[9px] text-gray-300">
                      Latest SIGINT analysis confirms elevated activity in the Mediterranean. Cross-referencing with open-source maritime data...
                    </div>
                 </div>

                 <div className="flex gap-2 flex-row-reverse">
                    <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                      <Icons.User size={10} className="text-gray-400" />
                    </div>
                    <div className="bg-military-cyan/10 border border-military-cyan/30 p-2 rounded-sm text-[9px] text-military-cyan">
                      Verify if this is a standard naval exercise.
                    </div>
                 </div>

                 <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-military-cyan flex items-center justify-center shrink-0">
                      <Icons.Cpu size={10} className="text-black" />
                    </div>
                    <div className="bg-black/60 border border-military-border p-2 rounded-sm text-[9px] text-gray-300">
                      Scanning NAVAREAs. No public NOTAMs or exercises found for this sector. Redirecting search to SENTRY Global mode for confirmation.
                    </div>
                 </div>
              </div>
            </div>

            <div className="pt-2 border-t border-military-border">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Consult Sentry AI..."
                  className="w-full bg-black/80 border border-military-border/50 rounded-sm py-2 pl-3 pr-10 text-[10px] text-military-cyan focus:outline-none focus:border-military-cyan/50 h-8"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-military-cyan opacity-50 hover:opacity-100">
                  <Icons.Send size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-military-border pb-2">
              <div className="flex items-center gap-2">
                <Icons.Globe size={14} className="text-military-cyan" />
                <span className="hud-text text-military-cyan font-black">SURFACE NEWS FEED</span>
              </div>
              <button 
                onClick={() => news.refresh()} 
                className={`text-[8px] px-1.5 py-0.5 border border-military-cyan/30 rounded hover:bg-military-cyan/10 transition-colors ${news.loading ? 'animate-pulse opacity-50' : ''}`}
              >
                {news.loading ? 'FETCHING...' : 'REFRESH'}
              </button>
            </div>

            {/* News Categories */}
            <div className="flex gap-1 overflow-x-auto pb-2 military-scroll no-scrollbar">
              {news.categories.map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => news.setActiveFilter(cat)}
                  className={`px-2 py-1 text-[7px] font-black uppercase rounded-[2px] border transition-all whitespace-nowrap ${news.activeFilter === cat ? 'bg-military-cyan text-black border-military-cyan shadow-[0_0_5px_#00f2ff]' : 'border-military-border text-gray-500 hover:text-gray-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 military-scroll pr-1 pb-4">
              {news.articles.length === 0 && !news.loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <Icons.WifiOff size={32} className="mb-2" />
                  <p className="text-[10px] uppercase font-black tracking-widest leading-loose">No feeds found // check proxy connectivity</p>
                </div>
              ) : (
                news.articles.map((article: any, i: number) => (
                  <div key={i} className="bg-black/40 border border-military-border/50 hover:border-military-cyan/30 transition-all p-3 space-y-2 group">
                    <div className="flex justify-between items-start text-[8px]">
                      <span className="font-black px-1.5 py-0.5 rounded-[2px] border" style={{ borderColor: `${article.sourceColor}40`, color: article.sourceColor }}>
                        {article.source}
                      </span>
                      <span className="text-gray-500 font-mono italic">
                        {new Date(article.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-gray-100 leading-tight group-hover:text-military-cyan transition-colors">{article.title}</h4>
                      <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 italic">{article.description}</p>
                    </div>
                    <div className="pt-2 flex justify-between items-center border-t border-military-border/30">
                      <span className="text-[7px] text-military-cyan/60 font-black uppercase tracking-tighter">INTELLIGENCE TYPE: {article.category}</span>
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-military-cyan hover:underline text-[8px] font-bold flex items-center gap-1"
                      >
                        FULL REPORT <Icons.ArrowUpRight size={10} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'legend' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 military-scroll">
            {Object.entries(LAYER_CATEGORIES).map(([catKey, catName]) => {
              const categoryLayers = layers.filter(l => l.category === catKey);
              if (categoryLayers.length === 0) return null;
              
              return (
                <div key={catKey} className="space-y-2">
                  <span className="hud-text text-gray-500 text-[9px] border-b border-military-border block pb-1">{catName}</span>
                  <div className="space-y-1">
                    {categoryLayers.map(layer => {
                      const Icon = (Icons as any)[layer.icon] || Icons.HelpCircle;
                      const isActive = activeLayers.includes(layer.id);
                      return (
                        <button
                          key={layer.id}
                          onClick={() => {
                            if (layer.id === 'news') {
                              setActiveTab('news');
                            } else {
                              toggleLayer(layer.id);
                            }
                          }}
                          className={`w-full flex items-center gap-3 py-1.5 px-2 rounded transition-all group ${isActive ? 'bg-military-cyan/10 text-military-cyan' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                          <Icon size={12} className={isActive ? 'text-military-cyan' : 'text-gray-600 group-hover:text-military-cyan'} />
                          <span className="text-[10px] font-bold flex-1 text-left tracking-tight">{layer.name}</span>
                          {isActive && <div className="w-1 h-1 bg-military-cyan rounded-full shadow-[0_0_5px_#00f2ff]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="space-y-3 pt-4">
              <span className="hud-text text-gray-500">Classification Levels</span>
              <div className="space-y-2 p-3 bg-black/40 rounded border border-military-border">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-military-critical rounded shadow-[0_0_8px_#ff4b4b]" />
                  <span className="text-[9px] font-black text-military-critical">CRITICAL / COMBAT OPS</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-military-alert rounded shadow-[0_0_8px_#ffcc00]" />
                  <span className="text-[9px] font-black text-military-alert">ELEVATED / INTEL ALERT</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-military-cyan rounded shadow-[0_0_8px_#00f2ff]" />
                  <span className="text-[9px] font-black text-military-cyan">STANDARD / MONITORING</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Status Bar */}
      <div className="p-2 border-t border-military-border bg-black/60 flex justify-between items-center text-[8px] font-mono tracking-tighter">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-military-green rounded-full animate-pulse shadow-[0_0_5px_#39ff14]" />
          <span className="text-military-green font-bold">NODE: US-EAST-INTEL</span>
        </div>
        <div className="flex gap-4 text-gray-500">
          <span>LATENCY: 14ms</span>
          <span className="animate-[pulse_2s_infinite]">DATA_STREAM: OK</span>
        </div>
      </div>
    </aside>
  );
};

export default TacticalSidebar;

