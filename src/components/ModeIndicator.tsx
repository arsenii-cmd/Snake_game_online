import React, { useState, useEffect } from 'react';
import { GameMode, Player } from '../types/game';

interface ModeIndicatorProps {
  gameMode: GameMode;
  players: Player[];
  running: boolean;
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({ gameMode, players, running }) => {
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('rgba(0, 200, 83, 0.9)');

  useEffect(() => {
    if (!running) {
      setText('');
      return;
    }

    let newText = '';
    let newBgColor = 'rgba(0, 200, 83, 0.9)';

    if (gameMode === 'classic') {
      newText = '🎮 Классический режим';
      newBgColor = 'rgba(0, 200, 83, 0.9)';
    } else if (gameMode === 'half-ghost' || gameMode === 'family-ghost') {
      const hasActiveGhost = players.some(p => p.isGhost);
      if (hasActiveGhost) {
        newText = '👻 Режим призрака активен!';
        newBgColor = 'rgba(156, 39, 176, 0.9)';
      } else {
        newText = gameMode === 'half-ghost' ? '👻 Полупризрак' : '👻 Семейка недопризраков';
        newBgColor = 'rgba(156, 39, 176, 0.7)';
      }
    } else if (gameMode === 'full-ghost') {
      newText = '👻 Полноценный призрак';
      newBgColor = 'rgba(156, 39, 176, 0.9)';
    } else if (gameMode === 'all-ghosts') {
      newText = '👻 Компашка призраков';
      newBgColor = 'rgba(156, 39, 176, 0.9)';
    } else if (gameMode === 'magic-shooter') {
      newText = '✨ Магический шутер';
      newBgColor = 'rgba(255, 215, 0, 0.9)';
    }

    setText(newText);
    setBgColor(newBgColor);
  }, [gameMode, players, running]);

  if (!text || !running) return null;

  return (
    <div 
      className="mode-indicator" 
      style={{ 
        display: 'block',
        backgroundColor: bgColor
      }}
    >
      {text}
    </div>
  );
};
