import React, { useState, useEffect } from 'react';
import { Player, SpecialEffect } from '../types/game';

interface ScoreBoardProps {
  players: Player[];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ players }) => {
  const [, forceUpdate] = useState({});

  // Обновляем каждые 100ms для таймеров
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getEffectInfo = (effect: number | null | undefined, timer: number | undefined) => {
    if (effect === undefined || effect === null || !timer) return null;
    
    const timeLeft = Math.max(0, Math.ceil((timer - Date.now()) / 1000));
    if (timeLeft <= 0) return null;

    let icon = '';
    
    if (effect === SpecialEffect.WEAPON) {
      icon = '🔫';
    } else if (effect === SpecialEffect.INVULNERABILITY) {
      icon = '🛡️';
    } else if (effect === SpecialEffect.DIARRHEA) {
      icon = '💧';
    }

    return { icon, timeLeft };
  };

  return (
    <div className="scores">
      {players.map((player, index) => {
        const name = player.type === 'bot' 
          ? `Бот ${index + 1}` 
          : `Игрок ${index + 1}`;
        
        const effectInfo = getEffectInfo(player.specialEffect, player.specialEffectTimer);
        
        return (
          <div 
            key={index} 
            className="score-item"
            style={{ 
              opacity: player.snake.alive ? 1 : 0.5,
              textDecoration: player.snake.alive ? 'none' : 'line-through'
            }}
          >
            <span 
              className="player-indicator" 
              style={{ backgroundColor: player.snake.color.head }}
            />
            <span>{name}: <strong>{player.score}</strong></span>
            {!player.snake.alive && <span style={{ marginLeft: '5px' }}>💀</span>}
            {player.isGhost && <span style={{ marginLeft: '5px' }}>👻</span>}
            {player.snake.alive && effectInfo && (
              <span style={{ 
                marginLeft: '5px',
                color: effectInfo.timeLeft <= 3 ? '#ff4444' : '#ffd60a',
                fontWeight: 'bold'
              }}>
                {effectInfo.icon} {effectInfo.timeLeft}с
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
