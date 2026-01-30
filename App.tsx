import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './services/GameEngine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import TechTree from './components/TechTree';
import MainMenu from './components/MainMenu';
import { GameState, GameStatus, TowerType } from './types';

// Global engine instance to persist across re-renders
const engine = new GameEngine(0); // Start at level 1 (index 0)

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(engine.state);
  const [buildModeTower, setBuildModeTower] = useState<TowerType | null>(null);
  const [moveModeTowerId, setMoveModeTowerId] = useState<string | null>(null);
  const [dragTowerId, setDragTowerId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  // Animation loop
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      engine.update(deltaTime);
      setGameState({ ...engine.state });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  const handleTowerMouseDown = useCallback((id: string, clientX: number, clientY: number) => {
    // Only allow drag if NO build mode, NO move mode, and NO wave active
    if (!buildModeTower && !moveModeTowerId && !engine.state.isWaveActive) {
      setDragTowerId(id);
      setDragPos({ x: clientX, y: clientY });
    }
  }, [buildModeTower, moveModeTowerId]);

  const handleCanvasMouseMove = useCallback((clientX: number, clientY: number) => {
    if (dragTowerId) {
      setDragPos({ x: clientX, y: clientY });
    }
  }, [dragTowerId]);

  const handleCanvasMouseUp = useCallback((gridX: number, gridY: number) => {
    if (dragTowerId) {
      // Attempt move
      // Logic: engine.moveTower checks costs and validity.
      engine.moveTower(dragTowerId, gridX, gridY);

      setDragTowerId(null); // End drag regardless of success
      engine.state.selectedTowerId = null; // Deselect to avoid confusion
    }
  }, [dragTowerId]);

  const handleSelectBuildTower = useCallback((type: TowerType) => {
    if (buildModeTower === type) setBuildModeTower(null);
    else {
      setBuildModeTower(type);
      setMoveModeTowerId(null);
      engine.state.selectedTowerId = null;
    }
  }, [buildModeTower]);

  const handleMoveStart = useCallback(() => {
    if (engine.state.selectedTowerId) {
      setMoveModeTowerId(engine.state.selectedTowerId);
      setBuildModeTower(null);
    }
  }, []);

  const handleTileClick = useCallback((x: number, y: number) => {
    // If dragging, ignore click logic (handled by MouseUp)
    if (dragTowerId) return;

    if (buildModeTower) {
      const success = engine.placeTower(buildModeTower, x, y);
      if (success) setBuildModeTower(null);
    } else if (moveModeTowerId) {
      const success = engine.moveTower(moveModeTowerId, x, y);
      if (success) {
        setMoveModeTowerId(null);
        engine.state.selectedTowerId = null; // Deselect after move
      }
    } else {
      engine.state.selectedTowerId = null;
    }
  }, [buildModeTower, moveModeTowerId, dragTowerId]);

  const handleTowerClick = useCallback((id: string) => {
    if (buildModeTower || moveModeTowerId || dragTowerId) return;
    engine.state.selectedTowerId = id;
  }, [buildModeTower, moveModeTowerId, dragTowerId]);

  const handleUpgrade = useCallback((upgradeIndex: number) => {
    if (engine.state.selectedTowerId) {
      engine.upgradeTower(engine.state.selectedTowerId, upgradeIndex);
    }
  }, []);

  const handleSell = useCallback(() => {
    if (engine.state.selectedTowerId) {
      engine.sellTower(engine.state.selectedTowerId);
    }
  }, []);

  const handleRetry = useCallback(() => {
    engine.retryLevel();
  }, []);

  const handleNextLevel = useCallback(() => {
    engine.nextLevel();
  }, []);

  const handleToggleTech = useCallback(() => {
    engine.toggleTechTree();
  }, []);

  const handleStartGame = useCallback(() => {
    engine.startGame();
  }, []);

  const handleStartWave = useCallback(() => {
    engine.startNextWave();
  }, []);

  const handlePause = useCallback(() => {
    engine.pauseGame();
  }, []);

  const handleSetSpeed = useCallback((speed: number) => {
    engine.setGameSpeed(speed);
  }, []);

  const [autoPilotEnabled, setAutoPilotEnabled] = useState(false);
  const handleToggleAutoPilot = useCallback(() => {
    // If toggling on from Defeat, we must reset game first
    if (gameState.status === GameStatus.DEFEAT) {
      engine.resetGame(gameState.levelIndex);
      engine.autoPilotEnabled = true; // Force ON
      engine.startNextWave(); // Auto-start
      setAutoPilotEnabled(true);
    } else {
      engine.autoPilotEnabled = !engine.autoPilotEnabled;
      setAutoPilotEnabled(engine.autoPilotEnabled);
    }
  }, [gameState.status, gameState.levelIndex]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== GameStatus.PLAYING) return;

      if (e.code === 'Space') engine.startNextWave();
      if (e.code === 'Escape') {
        if (gameState.showTechTree) engine.toggleTechTree();
        else {
          setBuildModeTower(null);
          engine.state.selectedTowerId = null;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.showTechTree, gameState.status]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020617] select-none touch-none font-sans text-white">

      {/* 0. Main Menu Layer */}
      {gameState.status === GameStatus.MENU && (
        <MainMenu onStart={handleStartGame} />
      )}

      {/* 1. Game Layer (Always rendered but hidden if menu to keep state?) 
          Actually best to keep rendered behind menu for seamless transition if desired, 
          but usually separate. Here we hide or show.
      */}
      {gameState.status !== GameStatus.MENU && (
        <>
          <GameCanvas
            state={gameState}
            grid={gameState.currentGrid}
            onTileClick={handleTileClick}
            onTowerClick={handleTowerClick}
            onTowerMouseDown={handleTowerMouseDown}
            onCanvasMouseMove={handleCanvasMouseMove}
            onCanvasMouseUp={handleCanvasMouseUp}
            dragTowerId={dragTowerId}
            dragPos={dragPos}
            engine={engine} // Pass engine for VFX rendering
          />

          {/* Tech Tree Modal Layer */}
          {gameState.showTechTree && (
            <TechTree engine={engine} onClose={handleToggleTech} />
          )}

          {/* UI Overlay Layer */}
          <HUD
            state={gameState}
            onStartWave={handleStartWave}
            onPause={handlePause}
            onSelectTowerToBuild={handleSelectBuildTower}
            selectedBuildType={buildModeTower}
            onUpgrade={handleUpgrade}
            onSell={handleSell}
            onMove={handleMoveStart}
            onRetry={handleRetry}
            onNextLevel={handleNextLevel}
            onSetSpeed={handleSetSpeed}
            onToggleTech={handleToggleTech}
            autoPilotEnabled={autoPilotEnabled}
            onToggleAutoPilot={handleToggleAutoPilot}
          />

          {/* Background Ambience (Vignette) for Game */}
          <div className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </>
      )}
    </div>
  );
};

export default App;
