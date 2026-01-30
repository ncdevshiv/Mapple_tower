import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { TILE_SIZE, GRID_COLS, GRID_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { TileAsset, TowerAsset, EnemyAsset, AssetDefs } from './GameAssets';
import { GameEngine } from '../services/GameEngine';

interface GameCanvasProps {
  state: GameState;
  grid: number[][]; // 0 or 1
  onTileClick: (x: number, y: number) => void;
  onTowerClick: (id: string) => void;
  engine: GameEngine;
  // Drag Support
  onTowerMouseDown?: (id: string, clientX: number, clientY: number) => void;
  onCanvasMouseMove?: (clientX: number, clientY: number) => void;
  onCanvasMouseUp?: (gridX: number, gridY: number) => void;
  dragTowerId?: string | null;
  dragPos?: { x: number, y: number };
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  state, grid, onTileClick, onTowerClick, engine,
  onTowerMouseDown, onCanvasMouseMove, onCanvasMouseUp, dragTowerId, dragPos
}) => {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionLayerRef = useRef<HTMLDivElement>(null);

  // Helper for simple clicks (fallback if no drag)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (interactionLayerRef.current) {
      const rect = interactionLayerRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const gridX = Math.floor(x / TILE_SIZE);
      const gridY = Math.floor(y / TILE_SIZE);
      onTileClick(gridX, gridY);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const padding = 20;
      const bottomReserved = window.innerWidth < 768 ? 160 : 20;
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - padding - bottomReserved;

      const gameWidth = GRID_COLS * TILE_SIZE;
      const gameHeight = GRID_ROWS * TILE_SIZE;

      const scaleX = availableWidth / gameWidth;
      const scaleY = availableHeight / gameHeight;
      const newScale = Math.min(scaleX, scaleY, 1.25);

      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // VFX Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual resolution match game grid
    canvas.width = GRID_COLS * TILE_SIZE;
    canvas.height = GRID_ROWS * TILE_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Force specific blending for glowing particles
    ctx.globalCompositeOperation = 'lighter';

    let rafId: number;
    const render = () => {
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      engine.vfx.draw(ctx);
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(rafId);
  }, [engine]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#020617] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black">
      <AssetDefs />

      <div
        className="relative transition-transform duration-200 ease-out origin-center rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.8)]"
        style={{
          width: GRID_COLS * TILE_SIZE,
          height: GRID_ROWS * TILE_SIZE,
          transform: `scale(${scale})`,
        }}
      >
        {/* Border Glow Container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-lg pointer-events-none"></div>

        {/* 1. Grid Layer (Tiles) */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)` }}>
          {grid.map((row, r) =>
            row.map((tile, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => onTileClick(c, r)}
                className={`w-full h-full relative cursor-pointer z-0`}
              >
                <TileAsset type={tile} x={c} y={r} />
              </div>
            ))
          )}
        </div>

        {/* 2. Towers Layer */}
        {state.towers.map(tower => {
          const isSelected = state.selectedTowerId === tower.id;
          return (
            <div
              key={tower.id}
              onClick={(e) => { e.stopPropagation(); onTowerClick(tower.id); }}
              className={`absolute transition-all duration-200 cursor-pointer group hover:z-20`}
              style={{
                left: tower.gridX * TILE_SIZE,
                top: tower.gridY * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                zIndex: 10 + tower.gridY
              }}
            >
              {isSelected && (
                <div
                  className="absolute rounded-full border border-cyan-400/30 bg-cyan-400/5 pointer-events-none animate-pulse"
                  style={{
                    width: tower.range * 2,
                    height: tower.range * 2,
                    left: TILE_SIZE / 2 - tower.range,
                    top: TILE_SIZE / 2 - tower.range,
                    zIndex: -1
                  }}
                />
              )}
              <div className={`
                w-full h-full p-0.5 relative transform transition-transform
                ${isSelected ? 'scale-110 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'hover:scale-105'}
              `}>
                <TowerAsset type={tower.type} level={tower.level} rotation={tower.rotation} />
              </div>
            </div>
          );
        })}

        {/* 3. Enemies Layer */}
        {state.enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute pointer-events-none transition-transform will-change-transform"
            style={{
              left: enemy.x,
              top: enemy.y,
              width: TILE_SIZE * 0.8,
              height: TILE_SIZE * 0.8,
              transform: 'translate(-50%, -60%)',
              zIndex: 20
            }}
          >
            {/* Health Bar */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10 z-30">
              <div
                className={`h-full shadow-[0_0_5px_currentColor] transition-all duration-100 ${enemy.type === 'TANK' ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
              />
            </div>
            {enemy.shield > 0 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-900/50 rounded-full overflow-hidden z-30">
                <div className="h-full bg-blue-400 w-full animate-pulse" />
              </div>
            )}
            <div className="w-full h-full">
              <EnemyAsset type={enemy.type} frozen={enemy.frozen} hasShield={enemy.shield > 0} />
            </div>
          </div>
        ))}

        {/* 4. VFX Canvas Layer (High Performance Particles) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-25 mix-blend-screen"
          style={{ zIndex: 25 }}
        />

        {/* 5. Projectiles Layer */}
        {state.projectiles.map(proj => (
          <div
            key={proj.id}
            className={`absolute rounded-full z-30 ${proj.color}`}
            style={{
              left: proj.x,
              top: proj.y,
              transform: 'translate(-50%, -50%)',
              width: proj.type === 'CANNON' ? '8px' : '4px',
              height: proj.type === 'CANNON' ? '8px' : '4px',
              boxShadow: `0 0 10px 2px currentColor`,
            }}
          />
        ))}

        {/* 6. Floating Text (Effects) */}
        {state.effects.map(fx => (
          <div
            key={fx.id}
            className="absolute font-black text-xl pointer-events-none z-50 animate-float-up title-font"
            style={{
              left: fx.x,
              top: fx.y,
              color: fx.color,
              textShadow: '0 0 5px currentColor',
              opacity: fx.life / 500,
            }}
          >
            {fx.text}
          </div>
        ))}
        {/* --- INTERACTIVE OVERLAY --- */}
        {/* 
          This transparent layer handles all mouse interactions map-aligned. 
          Use onMouseMove here to track grid position globally if needed, 
          but for Drag we might want window-level or full-canvas level.
      */}
        <div
          ref={interactionLayerRef}
          className="absolute inset-0 z-20 cursor-crosshair touch-none"
          onMouseMove={(e) => {
            if (onCanvasMouseMove) onCanvasMouseMove(e.clientX, e.clientY);
          }}
          onMouseUp={(e) => {
            if (interactionLayerRef.current) {
              const rect = interactionLayerRef.current.getBoundingClientRect();
              const scaleX = CANVAS_WIDTH / rect.width;
              const scaleY = CANVAS_HEIGHT / rect.height;
              const x = (e.clientX - rect.left) * scaleX;
              const y = (e.clientY - rect.top) * scaleY;
              const gridX = Math.floor(x / TILE_SIZE);
              const gridY = Math.floor(y / TILE_SIZE);

              if (dragTowerId && onCanvasMouseUp) {
                onCanvasMouseUp(gridX, gridY);
              } else {
                handleCanvasClick(e);
              }
            }
          }}
          onMouseDown={(e) => {
            // Basic click handled by MouseUp (Click optimization), 
            // but specific logic for starting drag is below
          }}
        >
          {/* Render Clickable Areas for Towers specifically for MouseDown */}
          {state.towers.map(tower => (
            <div
              key={tower.id}
              className="absolute cursor-grab active:cursor-grabbing hover:bg-white/10 rounded-full"
              style={{
                left: `${(tower.gridX * TILE_SIZE) / CANVAS_WIDTH * 100}%`,
                top: `${(tower.gridY * TILE_SIZE) / CANVAS_HEIGHT * 100}%`,
                width: `${TILE_SIZE / CANVAS_WIDTH * 100}%`,
                height: `${TILE_SIZE / CANVAS_HEIGHT * 100}%`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation(); // prevent canvas click?
                if (onTowerMouseDown) onTowerMouseDown(tower.id, e.clientX, e.clientY);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragTowerId) onTowerClick(tower.id);
              }}
            />
          ))}
        </div>

        {/* --- DRAG GHOST --- */}
        {dragTowerId && (
          <div
            className="fixed pointer-events-none z-50 opacity-50 flex flex-col items-center"
            style={{
              left: dragPos?.x,
              top: dragPos?.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-16 h-16 bg-white rounded-full border-2 border-dashed border-black"></div>
            {/* Could be smarter and render actual tower asset if we had simple component access */}
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded mt-2 font-mono">Move: -25% Gold</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
