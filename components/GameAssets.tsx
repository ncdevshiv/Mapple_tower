import React from 'react';
import { EnemyType, TileType, TowerType } from '../types';
import { TOWER_STATS } from '../constants';

export const AssetDefs = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      {/* Neon Glow Filters */}
      <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradients */}
      <linearGradient id="grad-metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
  </svg>
);

export const TileAsset: React.FC<{ type: TileType; x: number; y: number }> = ({ type, x, y }) => {
  // Cyber-Grid Style
  if (type === TileType.BUILDABLE) {
    return (
      <div className="w-full h-full border-[0.5px] border-slate-700/30 bg-slate-900/50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-slate-600/50 rounded-full"></div>
      </div>
    );
  }

  if (type === TileType.PATH) {
    return (
      <div className="w-full h-full bg-slate-800/80 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] border-x border-slate-700/50">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02)_100%)] bg-[length:10px_10px]"></div>
        {/* Directional arrow decoration could go here */}
      </div>
    );
  }

  if (type === TileType.START) {
    return (
      <div className="w-full h-full bg-slate-800 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-cyan-500/50 animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center text-cyan-500 font-bold text-xs tracking-widest">IN</div>
      </div>
    );
  }

  if (type === TileType.END) {
    return (
      <div className="w-full h-full bg-slate-800 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]">
        <div className="w-12 h-12 rounded-full border-2 border-red-500/50 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs tracking-widest">BASE</div>
      </div>
    );
  }

  return null;
};

export const TowerAsset: React.FC<{ type: TowerType; level: number; rotation?: number }> = ({ type, level, rotation = 0 }) => {
  const rotationDeg = (rotation * 180) / Math.PI;

  // Visual variations based on level
  const levelScale = 1 + (level - 1) * 0.1;
  const isMax = level >= 4;
  const glow = isMax ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : '';

  if (type === TowerType.ARROW) {
    return (
      <div className={`w-full h-full relative flex items-center justify-center ${glow}`} style={{ transform: `scale(${levelScale})` }}>
        {/* Base */}
        <div className="absolute w-12 h-12 bg-slate-800 rounded-lg border-2 border-slate-600 shadow-lg transform rotate-45"></div>
        {/* Turret */}
        <div
          className="relative w-14 h-14 transition-transform duration-100 ease-linear"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-amber-600 rounded-full border-2 border-amber-400 relative shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-2 bg-amber-400 rounded-r-md"></div>
              {level > 2 && <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-4 bg-amber-500/50 rounded-r-lg -z-10 blur-sm"></div>}
            </div>
          </div>
        </div>
        {/* Level Indicator */}
        <div className="absolute -bottom-2 w-full flex justify-center gap-0.5 pointer-events-none">
          {Array(level).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-sm"></div>)}
        </div>
      </div>
    );
  }

  if (type === TowerType.CANNON) {
    return (
      <div className={`w-full h-full relative flex items-center justify-center ${glow}`} style={{ transform: `scale(${levelScale})` }}>
        <div className="absolute w-14 h-14 bg-slate-900 rounded-full border-4 border-slate-700 shadow-xl"></div>
        <div
          className="relative w-16 h-16 transition-transform duration-100 ease-linear"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-12 bg-stone-800 rounded-sm border border-stone-600 relative flex items-center">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-8 bg-stone-900 border-2 border-stone-500 rounded-r-md translate-x-4"></div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-2 w-full flex justify-center gap-0.5 pointer-events-none">
          {Array(level).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-stone-400 rounded-full shadow-sm"></div>)}
        </div>
      </div>
    );
  }

  if (type === TowerType.FROST) {
    return (
      <div className={`w-full h-full relative flex items-center justify-center ${glow}`} style={{ transform: `scale(${levelScale})` }}>
        <div className="absolute w-10 h-10 bg-cyan-900/50 rotate-45 border border-cyan-500/30 animate-pulse-slow"></div>
        <div className="absolute w-12 h-12 border-2 border-cyan-400/50 rounded-full animate-spin-slow-reverse"></div>

        <div className="relative w-full h-full flex items-center justify-center z-10">
          <div className="w-4 h-10 bg-cyan-300 relative shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-full"></div>
        </div>

        <div className="absolute -bottom-2 w-full flex justify-center gap-0.5 pointer-events-none">
          {Array(level).fill(0).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-sm"></div>)}
        </div>
      </div>
    );
  }

  return null;
};


export const EnemyAsset: React.FC<{ type: EnemyType; frozen: boolean; hasShield: boolean }> = ({ type, frozen, hasShield }) => {
  const getBody = () => {
    switch (type) {
      case EnemyType.GRUNT:
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full relative border-2 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px]">👹</div>
          </div>
        );
      case EnemyType.RUNNER:
        return (
          <div className="w-6 h-6 bg-yellow-500 rotate-45 relative border-2 border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.6)] animate-pulse">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] -rotate-45">⚡</div>
          </div>
        );
      case EnemyType.TANK:
        return (
          <div className="w-10 h-10 bg-red-800 rounded-md relative border-4 border-red-950 shadow-[0_0_10px_rgba(153,27,27,0.6)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">🗿</div>
          </div>
        );
      case EnemyType.SHIELDED:
        return (
          <div className="w-9 h-9 bg-blue-700 rounded-full relative border-2 border-blue-400 shadow-[0_0_10px_rgba(29,78,216,0.6)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">🛡️</div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center transition-all ${frozen ? 'brightness-150 saturate-50' : ''}`}>
      {getBody()}
      {frozen && <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-pulse blur-sm"></div>}
      {hasShield && <div className="absolute -inset-1 border-2 border-blue-400/50 rounded-full animate-ping-slow"></div>}
    </div>
  );
};
