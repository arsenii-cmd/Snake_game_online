import React, { useState } from 'react';
import { MultiplayerClient } from '../core/MultiplayerClient';
import { GameMode } from '../types/game';
import '../styles/menu.css';

interface MultiplayerChoiceProps {
  onBack: () => void;
  onRoomReady?: (client: MultiplayerClient, roomCode: string, playerId: string, isHost: boolean, gameMode: GameMode) => void;
}

type Screen = 'main' | 'create' | 'join' | 'lobby';

export const MultiplayerChoice: React.FC<MultiplayerChoiceProps> = ({ onBack, onRoomReady }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [serverUrl, setServerUrl] = useState((import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8765');
  const [status, setStatus] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Создание комнаты
  const [playerName, setPlayerName] = useState('');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  
  // Присоединение к комнате
  const [roomCode, setRoomCode] = useState('');
  
  // Лобби
  const [client, setClient] = useState<MultiplayerClient | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>([]);
  const [lobbyGameMode, setLobbyGameMode] = useState<GameMode>('classic');

  const testConnection = async () => {
    setIsConnecting(true);
    setStatus('Подключение...');
    
    try {
      const ws = new WebSocket(serverUrl);
      
      ws.onopen = () => {
        setStatus('✅ Подключение успешно!');
        ws.close();
        setIsConnecting(false);
      };
      
      ws.onerror = () => {
        setStatus('❌ Ошибка подключения. Проверьте, что сервер запущен.');
        setIsConnecting(false);
      };
      
      ws.onclose = () => {
        if (isConnecting) {
          setStatus('❌ Не удалось подключиться к серверу.');
          setIsConnecting(false);
        }
      };
    } catch (error) {
      setStatus('❌ Ошибка: ' + error);
      setIsConnecting(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setStatus('❌ Введите имя игрока');
      return;
    }

    setIsConnecting(true);
    setStatus('Подключение к серверу...');

    try {
      const mpClient = new MultiplayerClient(serverUrl);
      await mpClient.connect();

      mpClient.on('room_created', (data) => {
        setCurrentRoomCode(data.room_code);
        setCurrentPlayerId(data.player_id);
        setIsHost(true);
        setLobbyGameMode(data.game_mode);
        setPlayers([{ id: data.player_id, name: playerName }]);
        setClient(mpClient);
        setScreen('lobby');
        setStatus('');
        setIsConnecting(false);
      });

      mpClient.on('player_joined', (data) => {
        setPlayers(prev => [...prev, { id: data.player_id, name: data.player_name }]);
        setStatus(`${data.player_name} присоединился`);
      });

      mpClient.on('player_left', (data) => {
        setPlayers(prev => prev.filter(p => p.id !== data.player_id));
        setStatus('Игрок вышел');
      });

      mpClient.on('error', (data) => {
        setStatus(`❌ ${data.message}`);
        setIsConnecting(false);
      });

      mpClient.createRoom(playerName, selectedMode);
    } catch (error) {
      setStatus('❌ Не удалось подключиться к серверу');
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setStatus('❌ Введите имя игрока');
      return;
    }

    if (!roomCode.trim()) {
      setStatus('❌ Введите код комнаты');
      return;
    }

    setIsConnecting(true);
    setStatus('Подключение к серверу...');

    try {
      const mpClient = new MultiplayerClient(serverUrl);
      await mpClient.connect();

      mpClient.on('room_joined', (data) => {
        setCurrentRoomCode(data.room_code);
        setCurrentPlayerId(data.player_id);
        setIsHost(false);
        setLobbyGameMode(data.game_mode);
        
        const playersList = Object.entries(data.players).map(([id, info]: [string, any]) => ({
          id,
          name: info.name
        }));
        setPlayers(playersList);
        
        setClient(mpClient);
        setScreen('lobby');
        setStatus('');
        setIsConnecting(false);
      });

      mpClient.on('player_joined', (data) => {
        setPlayers(prev => [...prev, { id: data.player_id, name: data.player_name }]);
        setStatus(`${data.player_name} присоединился`);
      });

      mpClient.on('player_left', (data) => {
        setPlayers(prev => prev.filter(p => p.id !== data.player_id));
        setStatus('Игрок вышел');
      });

      mpClient.on('error', (data) => {
        setStatus(`❌ ${data.message}`);
        setIsConnecting(false);
      });

      mpClient.joinRoom(roomCode.toUpperCase(), playerName);
    } catch (error) {
      setStatus('❌ Не удалось подключиться к серверу');
      setIsConnecting(false);
    }
  };

  const handleStartGame = () => {
    if (client && isHost) {
      client.startGame();
      if (onRoomReady) {
        onRoomReady(client, currentRoomCode, currentPlayerId, isHost, lobbyGameMode);
      }
    }
  };

  const handleLeaveLobby = () => {
    if (client) {
      client.disconnect();
      setClient(null);
    }
    setScreen('main');
    setPlayers([]);
    setStatus('');
  };

  const gameModes: Array<{ value: GameMode; label: string }> = [
    { value: 'classic', label: 'Классика' },
    { value: 'half-ghost', label: 'Полупризрак' },
    { value: 'family-ghost', label: 'Семейный призрак' },
    { value: 'full-ghost', label: 'Полный призрак' },
    { value: 'all-ghosts', label: 'Все призраки' },
    { value: 'magic-shooter', label: 'Магический стрелок' }
  ];

  if (screen === 'lobby') {
    return (
      <div className="menu-screen">
        <h2>Лобби</h2>
        
        <div style={{ 
          padding: '20px', 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Код комнаты: <span style={{ color: '#7c4dff' }}>{currentRoomCode}</span>
          </div>
          <div style={{ fontSize: '14px', color: '#adb5bd', marginBottom: '10px' }}>
            Режим: {gameModes.find(m => m.value === lobbyGameMode)?.label}
          </div>
          <div style={{ fontSize: '14px', color: '#adb5bd' }}>
            {isHost ? '👑 Вы хост' : 'Ожидание хоста...'}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Игроки ({players.length}/8):</h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {players.map((player, index) => (
              <div 
                key={player.id}
                style={{
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%',
                  background: `hsl(${index * 45}, 70%, 60%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  {player.name}
                  {player.id === currentPlayerId && ' (вы)'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {status && (
          <div style={{ 
            fontSize: '14px', 
            color: '#00c853',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {isHost && (
            <button 
              onClick={handleStartGame}
              disabled={players.length < 2}
              style={{
                padding: '15px 30px',
                background: players.length < 2 
                  ? 'rgba(100,100,100,0.3)' 
                  : 'linear-gradient(135deg, #00c853, #00a843)',
                cursor: players.length < 2 ? 'not-allowed' : 'pointer'
              }}
            >
              <span>🎮 Начать игру</span>
            </button>
          )}
          <button 
            onClick={handleLeaveLobby}
            className="menu-btn secondary"
          >
            <span>← Выйти</span>
          </button>
        </div>

        {isHost && players.length < 2 && (
          <div style={{ 
            fontSize: '12px', 
            color: '#f72585',
            marginTop: '10px',
            textAlign: 'center'
          }}>
            Нужно минимум 2 игрока для начала игры
          </div>
        )}
      </div>
    );
  }

  if (screen === 'create') {
    return (
      <div className="menu-screen">
        <h2>Создать комнату</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Ваше имя:
          </label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Введите имя"
            maxLength={20}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Режим игры:
          </label>
          <select 
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as GameMode)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '14px'
            }}
          >
            {gameModes.map(mode => (
              <option key={mode.value} value={mode.value} style={{ background: '#1a1a2e' }}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {status && (
          <div style={{ 
            fontSize: '14px', 
            color: status.includes('✅') ? '#00c853' : '#f72585',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={handleCreateRoom}
            disabled={isConnecting || !playerName.trim()}
            style={{
              padding: '15px 30px',
              background: (!playerName.trim() || isConnecting)
                ? 'rgba(100,100,100,0.3)'
                : 'linear-gradient(135deg, #00c853, #00a843)',
              cursor: (!playerName.trim() || isConnecting) ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{isConnecting ? '⏳ Подключение...' : '✅ Создать'}</span>
          </button>
          <button 
            onClick={() => setScreen('main')}
            className="menu-btn secondary"
          >
            <span>← Назад</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'join') {
    return (
      <div className="menu-screen">
        <h2>Присоединиться</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Ваше имя:
          </label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Введите имя"
            maxLength={20}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Код комнаты:
          </label>
          <input 
            type="text" 
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Введите код (например: ABC12)"
            maxLength={5}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '18px',
              textAlign: 'center',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}
          />
        </div>

        {status && (
          <div style={{ 
            fontSize: '14px', 
            color: status.includes('✅') ? '#00c853' : '#f72585',
            padding: '10px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={handleJoinRoom}
            disabled={isConnecting || !playerName.trim() || !roomCode.trim()}
            style={{
              padding: '15px 30px',
              background: (!playerName.trim() || !roomCode.trim() || isConnecting)
                ? 'rgba(100,100,100,0.3)'
                : 'linear-gradient(135deg, #7c4dff, #6a3de8)',
              cursor: (!playerName.trim() || !roomCode.trim() || isConnecting) ? 'not-allowed' : 'pointer'
            }}
          >
            <span>{isConnecting ? '⏳ Подключение...' : '🚪 Войти'}</span>
          </button>
          <button 
            onClick={() => setScreen('main')}
            className="menu-btn secondary"
          >
            <span>← Назад</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-screen">
      <h2>Мультиплеер</h2>
      
      <details style={{ margin: '10px 0', width: '100%' }}>
        <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#7c4dff', padding: '8px' }}>
          ⚙️ Настройки сервера
        </summary>
        <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#adb5bd' }}>
            WebSocket URL:
          </label>
          <input 
            type="text" 
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://192.168.1.100:8765 или wss://your-server.cloudpub.ru" 
            style={{
              width: '100%',
              padding: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              color: 'white',
              fontSize: '12px'
            }}
          />
          <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '5px' }}>
            <strong>Локальная игра (одна WiFi сеть):</strong><br/>
            • На компьютере с сервером: ws://localhost:8765<br/>
            • На других устройствах: ws://IP-АДРЕС:8765<br/>
            (Узнать IP: ipconfig в cmd, найти IPv4)<br/>
            <br/>
            <strong>Публичная игра (через интернет):</strong><br/>
            • Используйте START_PUBLIC_AUTO.bat<br/>
            • Вставьте URL: wss://your-url.cloudpub.ru<br/>
          </div>
        </div>
      </details>

      {status && (
        <div style={{ 
          fontSize: '14px', 
          color: status.includes('✅') ? '#00c853' : '#f72585',
          minHeight: '20px',
          margin: '10px 0',
          padding: '10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px'
        }}>
          {status}
        </div>
      )}

      <button 
        onClick={testConnection}
        disabled={isConnecting}
        style={{
          padding: '10px 20px',
          background: 'rgba(124,77,255,0.3)',
          border: '1px solid #7c4dff',
          marginBottom: '10px'
        }}
      >
        <span>🔌 Проверить подключение</span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
        <button 
          onClick={() => setScreen('create')}
          style={{
            minWidth: '250px',
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #00c853, #00a843)'
          }}
        >
          <span>Создать комнату</span>
        </button>
        <button 
          onClick={() => setScreen('join')}
          style={{
            minWidth: '250px',
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #7c4dff, #6a3de8)'
          }}
        >
          <span>Присоединиться к комнате</span>
        </button>
      </div>

      <button className="menu-btn secondary" onClick={onBack} style={{ marginTop: '20px' }}>
        <span>← Назад в меню</span>
      </button>

      <div className="instructions" style={{ marginTop: '20px' }}>
        <p><strong>Как играть онлайн:</strong></p>
        <p>1. Запустите сервер: <code>python server.py</code></p>
        <p>2. Проверьте подключение</p>
        <p>3. Создайте комнату или присоединитесь</p>
        <p>4. Поделитесь кодом комнаты с друзьями</p>
      </div>
    </div>
  );
};
