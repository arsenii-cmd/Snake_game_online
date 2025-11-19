import React, { useState, useEffect } from 'react';
import { MultiplayerClient } from '../core/MultiplayerClient';
import { GameMode } from '../types/game';
import '../styles/menu.css';

interface MultiplayerLobbyProps {
  client: MultiplayerClient;
  roomCode: string;
  playerId: string;
  isHost: boolean;
  gameMode: GameMode;
  onStartGame: () => void;
  onLeave: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  client,
  roomCode,
  playerId,
  isHost,
  gameMode,
  onStartGame,
  onLeave
}) => {
  const [players, setPlayers] = useState<Array<{ id: string; name: string }>>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const handlePlayerJoined = (data: any) => {
      setPlayers(prev => [...prev, { id: data.player_id, name: data.player_name }]);
      setStatus(`${data.player_name} присоединился`);
      setTimeout(() => setStatus(''), 3000);
    };

    const handlePlayerLeft = (data: any) => {
      setPlayers(prev => prev.filter(p => p.id !== data.player_id));
      setStatus('Игрок вышел');
      setTimeout(() => setStatus(''), 3000);
    };

    const handleGameStarted = () => {
      onStartGame();
    };

    client.on('player_joined', handlePlayerJoined);
    client.on('player_left', handlePlayerLeft);
    client.on('game_started', handleGameStarted);

    return () => {
      client.off('player_joined', handlePlayerJoined);
      client.off('player_left', handlePlayerLeft);
      client.off('game_started', handleGameStarted);
    };
  }, [client, onStartGame]);

  const gameModeLabels: Record<GameMode, string> = {
    'classic': 'Классика',
    'half-ghost': 'Полупризрак',
    'family-ghost': 'Семейный призрак',
    'full-ghost': 'Полный призрак',
    'all-ghosts': 'Все призраки',
    'magic-shooter': 'Магический стрелок'
  };

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
          Код комнаты: <span style={{ color: '#7c4dff' }}>{roomCode}</span>
        </div>
        <div style={{ fontSize: '14px', color: '#adb5bd', marginBottom: '10px' }}>
          Режим: {gameModeLabels[gameMode]}
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
                {player.id === playerId && ' (вы)'}
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
            onClick={() => client.startGame()}
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
          onClick={onLeave}
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
};
