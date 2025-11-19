import { useState, useRef, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { GameSetup } from './components/GameSetup';
import { ControlsSetup } from './components/ControlsSetup';
import { GameCanvas } from './components/GameCanvas';
import { ScoreBoard } from './components/ScoreBoard';
import { ModeIndicator } from './components/ModeIndicator';
import { PauseMenu } from './components/PauseMenu';
import { GameOver } from './components/GameOver';
import { MultiplayerChoice } from './components/MultiplayerChoice';
import { GameEngine } from './core/GameEngine';
import { MultiplayerClient } from './core/MultiplayerClient';
import { GameMode, ControlType } from './types/game';
import './styles/app.css';

type Screen = 'main-menu' | 'setup' | 'controls' | 'game' | 'multiplayer-choice';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main-menu');
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [setupData, setSetupData] = useState<{
    humanCount: number;
    botCount: number;
    gameMode: GameMode;
  } | null>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());
  
  // Мультиплеер
  const [multiplayerClient, setMultiplayerClient] = useState<MultiplayerClient | null>(null);
  const [_isMultiplayer, setIsMultiplayer] = useState(false);
  const [_isHost, setIsHost] = useState(false);
  const [_roomCode, setRoomCode] = useState('');

  // Создание звездного фона
  useEffect(() => {
    createStarField();

    // Debounce для resize
    let resizeTimeout: number;
    const debouncedCreateStars = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(createStarField, 300);
    };

    // Предотвращение нежелательных действий при свайпах
    const preventTouchMove = (e: TouchEvent) => {
      if (currentScreen === 'game' && 
          e.target instanceof HTMLElement &&
          e.target.tagName !== 'INPUT' && 
          e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };

    window.addEventListener('resize', debouncedCreateStars);
    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      window.removeEventListener('resize', debouncedCreateStars);
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [currentScreen]);

  const createStarField = () => {
    const bg = document.getElementById('floating-bg');
    if (!bg) return;
    
    bg.innerHTML = '';
    // Уменьшено количество звезд для производительности
    const starsCount = Math.min(50, Math.floor(window.innerWidth * window.innerHeight / 10000));
    
    for (let i = 0; i < starsCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.opacity = `${Math.random() * 0.6 + 0.2}`;
      bg.appendChild(star);
    }
  };

  const handleOfflineMode = () => {
    setCurrentScreen('setup');
  };

  const handleMultiplayerMode = () => {
    setCurrentScreen('multiplayer-choice');
  };

  const handleMultiplayerRoomReady = (
    client: MultiplayerClient,
    code: string,
    _playerId: string,
    host: boolean,
    gameMode: GameMode
  ) => {
    setMultiplayerClient(client);
    setRoomCode(code);
    setIsHost(host);
    setIsMultiplayer(true);

    // Настраиваем обработчики событий
    client.on('game_started', () => {
      // Хост инициализирует игру
      if (host) {
        engineRef.current = new GameEngine();
        engineRef.current.initGame(1, 0, gameMode, ['keyboard1']);
        setCurrentScreen('game');
        setIsPaused(false);
        setIsGameOver(false);
      } else {
        // Клиенты ждут состояния от хоста
        engineRef.current = new GameEngine();
        setCurrentScreen('game');
        setIsPaused(false);
        setIsGameOver(false);
      }
    });

    client.on('game_state_update', (_data) => {
      // Обновляем состояние игры от хоста
      if (!host) {
        // TODO: Применить состояние к движку
      }
    });

    client.on('remote_input', (_data) => {
      // Хост получает ввод от клиентов
      if (host) {
        // TODO: Применить ввод к соответствующему игроку
      }
    });

    client.on('game_over', () => {
      setIsGameOver(true);
    });
  };

  const handleSetupComplete = (
    humanCount: number, 
    botCount: number, 
    gameMode: GameMode
  ) => {
    setSetupData({ humanCount, botCount, gameMode });
    setCurrentScreen('controls');
  };

  const handleStartGame = (controls: ControlType[]) => {
    if (!setupData) return;

    const { humanCount, botCount, gameMode } = setupData;
    
    engineRef.current = new GameEngine();
    engineRef.current.initGame(humanCount, botCount, gameMode, controls);
    setCurrentScreen('game');
    setIsPaused(false);
    setIsGameOver(false);

    // Проверка окончания игры
    const checkInterval = setInterval(() => {
      const state = engineRef.current.getState();
      if (!state.running) {
        setIsGameOver(true);
        clearInterval(checkInterval);
      }
    }, 100);
  };

  const handlePause = () => {
    if (isPaused) {
      engineRef.current.resume();
    } else {
      engineRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const handleMainMenu = () => {
    engineRef.current.stop();
    if (multiplayerClient) {
      multiplayerClient.disconnect();
      setMultiplayerClient(null);
    }
    setIsMultiplayer(false);
    setIsHost(false);
    setRoomCode('');
    setCurrentScreen('main-menu');
    setIsPaused(false);
    setIsGameOver(false);
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setCurrentScreen('setup');
  };

  return (
    <div className="app">
      <div className="floating-bg" id="floating-bg"></div>
      <h1>Змейка — до 8 участников</h1>

      {currentScreen === 'main-menu' && (
        <>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            ⛶
          </button>
          <MainMenu 
            onOfflineMode={handleOfflineMode}
            onMultiplayerMode={handleMultiplayerMode}
          />
        </>
      )}

      {currentScreen === 'setup' && (
        <>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            ⛶
          </button>
          <GameSetup 
            onSetupComplete={handleSetupComplete}
            onBack={() => setCurrentScreen('main-menu')}
          />
        </>
      )}

      {currentScreen === 'controls' && setupData && (
        <>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            ⛶
          </button>
          <ControlsSetup 
            humanCount={setupData.humanCount}
            onStartGame={handleStartGame}
            onBack={() => setCurrentScreen('setup')}
          />
        </>
      )}

      {currentScreen === 'multiplayer-choice' && (
        <>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            ⛶
          </button>
          <MultiplayerChoice 
            onBack={() => setCurrentScreen('main-menu')}
            onRoomReady={handleMultiplayerRoomReady}
          />
        </>
      )}

      {currentScreen === 'game' && (
        <>
          <button className="pause-btn" onClick={handlePause}>
            {isPaused ? '▶' : '⏸'}
          </button>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            ⛶
          </button>
          <ModeIndicator 
            gameMode={engineRef.current.getState().gameMode}
            players={engineRef.current.getState().players}
            running={engineRef.current.getState().running}
          />
          <div id="game-container" className="game-container">
            <GameCanvas 
              engine={engineRef.current}
              onPause={handlePause}
            />
            {isPaused && (
              <PauseMenu 
                onResume={handlePause}
                onMainMenu={handleMainMenu}
              />
            )}
            {isGameOver && (
              <GameOver 
                players={engineRef.current.getState().players}
                onRestart={handleRestart}
              />
            )}
          </div>
          <ScoreBoard players={engineRef.current.getState().players} />

        </>
      )}
    </div>
  );
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}



export default App;
