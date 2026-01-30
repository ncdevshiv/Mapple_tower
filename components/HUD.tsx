import React, { useState } from 'react';
import { GameState, GameStatus, TowerType } from '../types';
import { TOWER_STATS } from '../constants';
import { TowerAsset } from './GameAssets';
import { LeaderboardUI } from './LeaderboardUI';

interface HUDProps {
  state: GameState;
  onStartWave: () => void;
  onPause: () => void;
  onSelectTowerToBuild: (type: TowerType) => void;
  selectedBuildType: TowerType | null;
  onUpgrade: (upgradeIndex: number) => void;
  onSell: () => void;
  onMove?: () => void;
  onRetry: () => void;
  onNextLevel: () => void;
  onSetSpeed: (speed: number) => void;
  onToggleTech: () => void;
  autoPilotEnabled: boolean;
  onToggleAutoPilot: () => void;
}

const HUD: React.FC<HUDProps> = ({
  state, onStartWave, onPause, onSelectTowerToBuild,
  selectedBuildType, onUpgrade, onSell, onRetry, onNextLevel, onSetSpeed, onToggleTech,
  autoPilotEnabled, onToggleAutoPilot, onMove
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const selectedTower = state.selectedTowerId
    ? state.towers.find(t => t.id === state.selectedTowerId)
    : null;

  const isStartWaveDisabled = state.isWaveActive || state.status !== GameStatus.PLAYING;

  // Common glass panel style
  const glassPanel = "bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]";
  const neonText = "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]";
  const neonBorder = "border border-cyan-500/50 box-glow shadow-[0_0_10px_rgba(34,211,238,0.2)]";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-50 overflow-hidden text-white game-font">

      {/* --- TOP BAR --- */}
      <div className="pointer-events-auto p-4 flex items-start justify-between w-full max-w-7xl mx-auto">

        {/* Resource Container */}
        <div className="flex flex-col gap-2 scale-90 origin-top-left md:scale-100">
          <div className={`flex ${glassPanel} rounded-xl px-5 py-2 gap-6 items-center border-t border-l border-white/20`}>
            <div className="flex items-center gap-2">
              <div className="text-red-500 text-2xl drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">♥</div>
              <span className="text-2xl font-bold tracking-widest">{state.lives}</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="text-yellow-400 text-2xl drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">⬡</div>
              <span className="text-2xl font-bold text-yellow-100 tracking-widest">{state.gold}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className={`${glassPanel} rounded-lg px-4 py-1 flex items-center gap-2`}>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Wave</span>
              <div className={`text-xl font-bold ${neonText}`}>{state.wave} / 6</div>
            </div>
            {/* Tech Tree Button */}
            <button
              onClick={onToggleTech}
              className="bg-cyan-900/80 hover:bg-cyan-700/80 border border-cyan-500/50 rounded-lg px-3 py-1 backdrop-blur-sm flex items-center gap-2 transition-all active:scale-95 group"
            >
              <span className="text-lg group-hover:animate-pulse">💠</span>
              <span className="text-xs font-bold text-cyan-100 uppercase tracking-wider">Tech</span>
            </button>
            {/* Leaderboard Button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="bg-amber-900/80 hover:bg-amber-700/80 border border-amber-500/50 rounded-lg px-3 py-1 backdrop-blur-sm flex items-center gap-2 transition-all active:scale-95 group"
            >
              <span className="text-lg">🏆</span>
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Rank</span>
            </button>
          </div>
        </div>

        {/* Level Title, Speed & Pause */}
        <div className="flex flex-col items-end gap-2 scale-90 origin-top-right md:scale-100">
          <div className={`${glassPanel} px-8 py-2 rounded-b-xl border-t-0 border-x-secondary`}>
            <h1 className="title-font text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest drop-shadow-sm">
              Level {state.levelIndex + 1}
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSetSpeed(1)}
              className={`w-10 h-10 rounded bg-slate-800/80 border border-white/10 flex items-center justify-center transition-all hover:bg-slate-700
                 ${state.gameSpeed === 1 ? 'text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-slate-500'}`}
            >
              ▶
            </button>
            <button
              onClick={() => onSetSpeed(2)}
              className={`w-10 h-10 rounded bg-slate-800/80 border border-white/10 flex items-center justify-center transition-all hover:bg-slate-700
                 ${state.gameSpeed === 2 ? 'text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-slate-500'}`}
            >
              ⏩
            </button>
            <button
              onClick={onPause}
              className="w-10 h-10 rounded bg-slate-800/80 border border-white/10 text-white hover:bg-slate-700 flex items-center justify-center transition-all"
            >
              {state.status === GameStatus.PAUSED ? '▶' : '||'}
            </button>
          </div>
        </div>
      </div>

      {/* --- MIDDLE: ALERTS --- */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {(state.status === GameStatus.VICTORY || state.status === GameStatus.DEFEAT) && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center max-w-md w-full animate-bounce-in ring-1 ring-white/20">
            <h2 className={`title-font text-6xl font-black mb-4 tracking-tighter ${state.status === GameStatus.VICTORY ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}>
              {state.status === GameStatus.VICTORY ? 'VICTORY' : 'FAILURE'}
            </h2>
            <p className="text-slate-300 mb-8 text-lg uppercase tracking-widest font-light">
              {state.status === GameStatus.VICTORY ? 'Sector Secured' : 'Systems Breached'}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={onRetry} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-none border border-white/20 font-bold text-lg uppercase tracking-wider transition-all hover:border-white/50">
                Reboot
              </button>
              {state.status === GameStatus.VICTORY && (
                <button onClick={onNextLevel} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-none font-bold text-lg uppercase tracking-wider text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]">
                  Next Sector
                </button>
              )}
              {state.status === GameStatus.DEFEAT && (
                <button
                  onClick={onToggleAutoPilot}
                  className="px-6 py-3 bg-purple-900/80 hover:bg-purple-800/80 border border-purple-500/50 font-bold text-lg uppercase tracking-wider text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2"
                >
                  <span>🤖</span> Auto-Replay
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM BAR: CONTROLS --- */}
      <div className="pointer-events-auto w-full flex items-end justify-center p-4 pb-6">
        <div className="w-full max-w-5xl flex gap-4 items-end relative">

          {selectedTower ? (
            // UPGRADE PANEL
            <div className={`flex-1 ${glassPanel} rounded-t-2xl p-6 flex flex-col md:flex-row gap-8 animate-slide-up w-full`}>
              <div className="flex flex-col justify-between items-start min-w-[150px]">
                <div>
                  <h3 className="title-font text-2xl font-black text-white uppercase mb-2 tracking-wider">{TOWER_STATS[selectedTower.type].name}</h3>
                  <div className="flex gap-3">
                    <span className="bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-2 py-1 rounded">LVL {selectedTower.level}</span>
                    <span className="text-slate-400 text-xs font-mono py-1">RNG: {Math.round(selectedTower.range)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onSell}
                    className="mt-4 flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-200 text-xs font-bold px-4 py-2 rounded uppercase transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  >
                    Sell (+{(state.wave === 0 && !state.isWaveActive) ? TOWER_STATS[selectedTower.type].cost : Math.floor(TOWER_STATS[selectedTower.type].cost * 0.5)})
                  </button>
                  {(!state.isWaveActive) && onMove && (
                    <button
                      onClick={onMove}
                      className="mt-4 flex-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/30 text-amber-200 text-xs font-bold px-4 py-2 rounded uppercase transition-all"
                    >
                      Move
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
                {selectedTower.level < 4 ? (
                  TOWER_STATS[selectedTower.type].upgrades.map((upgrade, idx) => {
                    const canAfford = state.gold >= upgrade.cost;
                    return (
                      <button
                        key={idx}
                        onClick={() => canAfford && onUpgrade(idx)}
                        className={`
                          flex-1 min-w-[140px] p-0.5 rounded-lg transition-all group relative overflow-hidden
                          ${canAfford ? 'hover:-translate-y-1' : 'opacity-50 grayscale cursor-not-allowed'}
                        `}
                      >
                        <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity ${canAfford ? 'bg-gradient-to-tr from-cyan-500 to-blue-500' : 'bg-slate-700'}`}></div>
                        <div className="relative bg-slate-900/90 h-full p-3 rounded-[6px] flex flex-col justify-between border border-white/5">
                          <div>
                            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">{upgrade.type}</div>
                            <div className="text-slate-300 text-[11px] leading-tight mb-2 h-8">{upgrade.description}</div>
                          </div>
                          <div className={`text-center py-1 text-xs font-mono font-bold rounded ${canAfford ? 'text-yellow-300 bg-yellow-900/20 border border-yellow-500/20' : 'text-red-400'}`}>
                            {upgrade.cost} G
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="w-full h-24 flex items-center justify-center border border-dashed border-white/10 rounded-lg bg-white/5">
                    <span className="text-slate-500 text-sm font-mono uppercase tracking-widest">Max Level Reached</span>
                  </div>
                )}
              </div>

              <button onClick={() => onSelectTowerToBuild(selectedTower.type)} className="absolute top-2 right-2 text-slate-500 p-2 md:hidden">
                ✖
              </button>
            </div>
          ) : (
            // BUILD PANEL
            <div className="flex-1 flex gap-3 md:gap-4 items-end px-2">
              {Object.values(TOWER_STATS).map(tower => {
                const canAfford = state.gold >= tower.cost;
                const isSelected = selectedBuildType === tower.id;
                return (
                  <button
                    key={tower.id}
                    onClick={() => canAfford && onSelectTowerToBuild(tower.id)}
                    className={`
                      relative group flex-1 h-28 md:h-32 rounded-lg transition-all transform flex flex-col items-center justify-end pb-3 overflow-visible border
                      ${isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] -translate-y-2 z-10'
                        : 'bg-slate-900/80 border-white/10 hover:bg-slate-800 hover:-translate-y-1 hover:border-white/30'}
                      ${!canAfford ? 'opacity-40 grayscale' : ''}
                    `}
                  >
                    <div className={`absolute -top-6 transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'group-hover:scale-105'}`}>
                      <div className="w-16 h-16 md:w-20 md:h-20 drop-shadow-xl">
                        <TowerAsset type={tower.id} level={1} />
                      </div>
                    </div>
                    <div className="text-white font-bold uppercase text-[10px] md:text-xs tracking-wider mt-8">{tower.name}</div>
                    <div className={`font-mono px-2 py-0.5 rounded mt-1 text-[10px] md:text-xs flex items-center gap-1 border
                      ${canAfford ? 'bg-yellow-900/30 text-yellow-200 border-yellow-500/30' : 'bg-red-900/30 text-red-300 border-red-500/30'}
                    `}>
                      {tower.cost}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!selectedTower && (
            <button
              onClick={onStartWave}
              disabled={isStartWaveDisabled}
              className={`
                w-24 h-24 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 mb-2 shrink-0
                ${isStartWaveDisabled
                  ? 'bg-slate-800 border-slate-700 text-slate-600 grayscale cursor-not-allowed'
                  : 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-pulse-slow'}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl drop-shadow-md">⚔️</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {showLeaderboard && (
        <LeaderboardUI
          levelId={state.levelIndex + 1}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};

export default HUD;
