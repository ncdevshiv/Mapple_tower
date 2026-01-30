import React, { useState } from 'react';
import { GameEngine } from '../services/GameEngine';
import { TECH_TREE } from '../constants';

interface TechTreeProps {
  engine: GameEngine;
  onClose: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({ engine, onClose }) => {
  const [profile, setProfile] = useState(engine.persistence.getProfile());

  const handleBuy = (techId: string) => {
    const tech = TECH_TREE.find(t => t.id === techId);
    if (!tech) return;
    
    // Check cost
    if (engine.persistence.spendGems(tech.cost)) {
      engine.persistence.unlockTech(techId);
      engine.sound.playUI('upgrade');
      // Update local UI state
      setProfile({ ...engine.persistence.getProfile() });
    } else {
      engine.sound.playUI('error');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border-4 border-slate-600 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center border-b border-slate-700">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-wider">Tech Tree</h2>
            <p className="text-slate-400 text-sm">Permanent upgrades for your kingdom</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-600">
              <span className="text-2xl">💎</span>
              <span className="text-2xl font-black text-cyan-400">{profile.gems}</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-600 text-white font-bold hover:bg-red-500"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_TREE.map(tech => {
              const currentLevel = profile.unlockedTechs[tech.id] || 0;
              const isMaxed = currentLevel >= tech.maxLevels;
              const canAfford = profile.gems >= tech.cost;
              
              return (
                <div 
                  key={tech.id} 
                  className={`
                    relative p-6 rounded-2xl border-b-8 transition-all
                    ${isMaxed ? 'bg-emerald-900 border-emerald-950 opacity-80' : 'bg-slate-700 border-slate-900'}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{tech.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isMaxed ? 'bg-emerald-500 text-emerald-900' : 'bg-slate-900 text-slate-400'}`}>
                      LVL {currentLevel} / {tech.maxLevels}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-6 h-10">{tech.description}</p>
                  
                  {!isMaxed ? (
                    <button
                      onClick={() => handleBuy(tech.id)}
                      disabled={!canAfford}
                      className={`
                        w-full py-3 rounded-xl font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all
                        ${canAfford 
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg active:translate-y-1' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                      `}
                    >
                      <span>Unlock</span>
                      <span className="bg-black/20 px-2 py-0.5 rounded text-sm">{tech.cost} 💎</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 text-center font-black text-emerald-400 uppercase tracking-widest bg-black/20 rounded-xl">
                      MAXED
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechTree;
