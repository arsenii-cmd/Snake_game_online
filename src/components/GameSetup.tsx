import React, { useState } from 'react';
import { GameMode } from '../types/game';
import { ModeDescription } from './ModeDescription';
import '../styles/menu.css';

interface GameSetupProps {
  onSetupComplete: (humanCount: number, botCount: number, gameMode: GameMode) => void;
  onBack: () => void;
}

const getModeDisplayName = (mode: GameMode): string => {
  const names: Record<GameMode, string> = {
    'classic': 'Классика',
    'half-ghost': 'Полупризрак',
    'family-ghost': 'Семейка недопризраков',
    'full-ghost': 'Полноценный призрак',
    'all-ghosts': 'Компашка призраков',
    'magic-shooter': 'Магический шутер'
  };
  return names[mode];
};

export const GameSetup: React.FC<GameSetupProps> = ({ onSetupComplete, onBack }) => {
  const [humanCount, setHumanCount] = useState(1);
  const [botCount, setBotCount] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [showHumanDropdown, setShowHumanDropdown] = useState(false);
  const [showBotDropdown, setShowBotDropdown] = useState(false);
  const [modeDescription, setModeDescription] = useState<{ mode: string; x: number; y: number } | null>(null);
  const [error, setError] = useState('');
  
  const handleMouseEnter = (mode: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setModeDescription({ 
      mode, 
      x: rect.left + rect.width / 2, // Центр кнопки
      y: rect.bottom // Низ кнопки
    });
  };
  
  const handleMouseLeave = () => {
    // Убираем задержку - описание должно исчезать сразу
    setModeDescription(null);
  };

  const handleContinue = () => {
    if (humanCount + botCount > 8) {
      setError('Максимум 8 игроков!');
      return;
    }
    if (humanCount + botCount < 1) {
      setError('Должен быть хотя бы один игрок!');
      return;
    }
    if (humanCount < 1) {
      setError('Должен быть хотя бы один игрок-человек!');
      return;
    }
    setError('');
    onSetupComplete(humanCount, botCount, gameMode);
  };

  return (
    <div className="menu-screen">
      <h2>Настройка офлайн игры</h2>
      
      <div className="selection-row">
        <label>Игроков (1–4):</label>
        <div className="custom-select-container">
          <button 
            className="custom-select-button" 
            onClick={() => setShowHumanDropdown(!showHumanDropdown)}
            onBlur={() => setTimeout(() => setShowHumanDropdown(false), 200)}
          >
            {humanCount}
          </button>
          {showHumanDropdown && (
            <div className="custom-select-options">
              {[1, 2, 3, 4].map(n => (
                <div 
                  key={n} 
                  className="custom-select-option"
                  onClick={() => { setHumanCount(n); setShowHumanDropdown(false); }}
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="selection-row">
        <label>Ботов (0–7):</label>
        <div className="custom-select-container">
          <button 
            className="custom-select-button"
            onClick={() => setShowBotDropdown(!showBotDropdown)}
            onBlur={() => setTimeout(() => setShowBotDropdown(false), 200)}
          >
            {botCount}
          </button>
          {showBotDropdown && (
            <div className="custom-select-options">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                <div 
                  key={n} 
                  className="custom-select-option"
                  onClick={() => { setBotCount(n); setShowBotDropdown(false); }}
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="selection-row game-mode-selection">
        <label>Режим игры:</label>
        <div className="mode-selector">
          <button 
            className={`mode-btn ${gameMode === 'classic' ? 'active' : ''}`}
            onClick={() => setGameMode('classic')}
            onMouseEnter={(e) => handleMouseEnter('classic', e)}
            onMouseLeave={handleMouseLeave}
          >
            Классика
          </button>
          <div className="ghost-container">
            <button 
              className={`mode-btn ${gameMode.includes('ghost') ? 'active' : ''}`}
              onMouseEnter={(e) => handleMouseEnter('ghost-main', e)}
              onMouseLeave={handleMouseLeave}
            >
              Призрак ▼
            </button>
            <div className="ghost-submodes">
              <button 
                className="submode-btn"
                onClick={() => setGameMode('half-ghost')}
                onMouseEnter={(e) => handleMouseEnter('half-ghost', e)}
                onMouseLeave={handleMouseLeave}
              >
                Полупризрак
              </button>
              <button 
                className="submode-btn"
                onClick={() => setGameMode('family-ghost')}
                onMouseEnter={(e) => handleMouseEnter('family-ghost', e)}
                onMouseLeave={handleMouseLeave}
              >
                Семейка недопризраков
              </button>
              <button 
                className="submode-btn"
                onClick={() => setGameMode('full-ghost')}
                onMouseEnter={(e) => handleMouseEnter('full-ghost', e)}
                onMouseLeave={handleMouseLeave}
              >
                Полноценный призрак
              </button>
              <button 
                className="submode-btn"
                onClick={() => setGameMode('all-ghosts')}
                onMouseEnter={(e) => handleMouseEnter('all-ghosts', e)}
                onMouseLeave={handleMouseLeave}
              >
                Компашка призраков
              </button>
            </div>
          </div>
          <button 
            className={`mode-btn ${gameMode === 'magic-shooter' ? 'active' : ''}`}
            onClick={() => setGameMode('magic-shooter')}
            onMouseEnter={(e) => handleMouseEnter('magic-shooter', e)}
            onMouseLeave={handleMouseLeave}
          >
            Магический шутер
          </button>
        </div>
      </div>

      <div className="mode-description-container">
        {modeDescription && (
          <ModeDescription mode={modeDescription.mode} x={modeDescription.x} y={modeDescription.y} />
        )}
      </div>

      <div className="selected-mode-display">
        <span>Выбранный режим:</span>
        <span className="mode-name">{getModeDisplayName(gameMode)}</span>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button className="menu-btn primary" onClick={handleContinue}>
        <span>Настроить управление</span>
      </button>
      <button className="menu-btn secondary" onClick={onBack}>
        <span>← Назад в меню</span>
      </button>

      <div className="instructions">
        <p>До 8 змеек могут соревноваться одновременно!</p>
        <p>Управление: клавиатура или свайпы на экране</p>
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#adb5bd' }}>
          Пауза: <kbd>Esc</kbd> / <kbd>ё</kbd> / <kbd>`</kbd>
        </p>
      </div>
    </div>
  );
};
