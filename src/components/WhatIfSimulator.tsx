import React, { useState } from 'react';
import { Send, Zap, Shield, Globe } from 'lucide-react';
import * as Icons from 'lucide-react';

interface WhatIfSimulatorProps {
  onClose: () => void;
}

const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggles, setToggles] = useState({
    kinetic: true,
    econ: true,
    cyber: false
  });

  const toggleEffect = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const runSimulation = () => {
    if (!query) return;
    setLoading(true);
    // Simulated AI response for "What-If" sensitive to toggles
    setTimeout(() => {
      let output = `PROJECTION: A ${query} event analysis completed.\n\n`;
      if (toggles.kinetic) output += `[KINETIC]: Immediate realignment of Carrier Strike Group 5. Local security forces at high alert.\n`;
      if (toggles.econ) output += `[ECONOMIC]: 35% increase in regional maritime insurance. Semiconductor supply chain delay: 4-6 weeks.\n`;
      if (toggles.cyber) output += `[CYBER]: 82% confidence of targeted grid attacks in the next 72hrs. SIGINT shows elevated scanner activity.\n`;
      if (!toggles.kinetic && !toggles.econ && !toggles.cyber) output += `[WARNING]: No effect parameters selected. Broad spectrum analysis suggests 15% increase in regional instability.`;
      
      setResult(output);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4 shadow-2xl border-military-cyan/30 bg-black/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-military-border pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-military-green shadow-[0_0_8px_#39ff14]" />
          <span className="hud-text text-military-green leading-none font-black italic">Scenario Simulator // ALPHA-V4</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-military-cyan transition-colors"
        >
          <Icons.X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(['kinetic', 'econ', 'cyber'] as const).map(type => (
          <button
            key={type}
            onClick={() => toggleEffect(type)}
            className={`flex flex-col items-center gap-1.5 p-2 rounded border transition-all ${toggles[type] ? 'bg-military-cyan/20 border-military-cyan text-military-cyan shadow-[0_0_10px_rgba(0,242,255,0.2)]' : 'bg-black/40 border-military-border text-gray-600 grayscale hover:grayscale-0'}`}
          >
            {type === 'kinetic' && <Shield size={14} />}
            {type === 'econ' && <Globe size={14} />}
            {type === 'cyber' && <Icons.Cpu size={14} />}
            <span className="text-[8px] font-black uppercase tracking-tighter">{type}</span>
          </button>
        ))}
      </div>
      
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter hypothetical event (e.g. 'Suez Canal Blockade')..."
          className="w-full bg-black/60 border border-military-border rounded p-3 text-xs text-military-cyan min-h-[70px] focus:outline-none focus:border-military-cyan/50 placeholder:text-gray-600 font-mono"
        />
        <button 
          onClick={runSimulation}
          disabled={loading}
          className="absolute bottom-3 right-3 p-2 bg-military-cyan/20 hover:bg-military-cyan/40 text-military-cyan rounded transition-all disabled:opacity-50"
        >
          {loading ? <Icons.Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </div>

      {result && (
        <div className="p-3 bg-military-cyan/5 border border-military-cyan/10 rounded-sm animate-in zoom-in-95 duration-300">
          <div className="text-[9px] font-black text-military-cyan/40 mb-2 uppercase tracking-tight flex items-center gap-2">
            <Icons.Terminal size={10} /> Simulation Output // SENTRY_KERNEL_PROJECTION
          </div>
          <div className="text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};


export default WhatIfSimulator;
