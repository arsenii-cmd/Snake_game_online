import React, { useState, useEffect } from 'react';
import { Player, SpecialEffect } from '../types/game';

interface LegendProps {
  players: Player[];
}

export const Legend: React.FC<LegendProps> = ({ players }) => {
  const [, forceUpdate] = useState({});

  // Обновляем компонент каждые 100ms для отображения таймеров
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
    let name = '';
    
    if (effect === SpecialEffect.WEAPON) {
      icon = '🔫';
      name = 'Оружие';
    } else if (effect === SpecialEffect.INVULNERABILITY) {
      icon = '🛡️';
      name = 'Щит';
    } else if (effect === SpecialEffect.DIARRHEA) {
      icon = '💧';
      name = 'Диарея';
    }

    return { icon, name, timeLeft };
  };

  return (
    <div className="legend">
      {players.map((player, index) => {
        const name = player.type === 'bot' 
          ? `Бот ${index + 1}` 
          : `Игрок ${index + 1}`;
        
        const effectInfo = getEffectInfo(player.specialEffect, player.specialEffectTimer);
        
        return (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                backgroundColor: player.snake.color.head,
                opacity: player.snake.alive ? 1 : 0.5
              }}
            />
            <span style={{ 
              opacity: player.snake.alive ? 1 : 0.7,
              textDecoration: player.snake.alive ? 'none' : 'line-through',
              minWidth: '80px',
              display: 'inline-block'
            }}>
              {name}
            </span>
            
            {/* Статус игрока */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
              {!player.snake.alive && <span title="Мертв">💀</span>}
              {player.isGhost && <span title="Призрак">👻</span>}
              
              {/* Активный эффект с таймером */}
              {player.snake.alive && effectInfo && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <span title={effectInfo.name}>{effectInfo.icon}</span>
                  <span style={{ 
                    color: effectInfo.timeLeft <= 3 ? '#ff4444' : '#ffd60a',
                    fontWeight: 'bold',
                    minWidth: '20px'
                  }}>
                    {effectInfo.timeLeft}с
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
