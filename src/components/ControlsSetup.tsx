import React, { useState } from 'react';
import { ControlType } from '../types/game';
import '../styles/menu.css';

interface ControlsSetupProps {
  humanCount: number;
  onStartGame: (controls: ControlType[]) => void;
  onBack: () => void;
}

const controlNames: Record<ControlType, string> = {
  'keyboard1': 'Клавиатура (ЦФЫВ / WASD)',
  'keyboard2': 'Клавиатура (НПРО / YGHJ)',
  'keyboard3': 'Клавиатура (ЗДЖЭ / PL;\')',
  'keyboard4': 'Клавиатура (Стрелки)',
  'swipe': 'Свайпы'
};

export const ControlsSetup: React.FC<ControlsSetupProps> = ({ humanCount, onStartGame, onBack }) => {
  const [controls, setControls] = useState<ControlType[]>([
    'keyboard1',
    'keyboard2',
    'keyboard3',
    'keyboard4'
  ]);

  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleControlChange = (playerIndex: number, control: ControlType) => {
    const newControls = [...controls];
    newControls[playerIndex] = control;
    setControls(newControls);
    setShowDropdown(null);
  };

  const handleStart = () => {
    // Проверка на мобильных устройствах
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (!isMobile) {
      for (let i = 0; i < humanCount; i++) {
        if (controls[i] === 'swipe') {
          setError(`Игрок ${i + 1} выбрал свайпы, но устройство не сенсорное. Выберите клавиатуру.`);
          return;
        }
      }
    }

    setError('');
    onStartGame(controls.slice(0, humanCount));
  };

  return (
    <div className="menu-screen">
      <h2>Настройка управления игроками</h2>
      
      <div className="control-settings">
        {Array.from({ length: humanCount }).map((_, index) => (
          <div key={index} className="control-row">
            <label>Игрок {index + 1}:</label>
            <div className="custom-select-container">
              <button 
                className="custom-select-button"
                onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                onBlur={() => setTimeout(() => setShowDropdown(null), 200)}
              >
                {controlNames[controls[index]]}
              </button>
              {showDropdown === index && (
                <div className="custom-select-options">
                  {(Object.keys(controlNames) as ControlType[]).map(controlType => (
                    <div
                      key={controlType}
                      className="custom-select-option"
                      onClick={() => handleControlChange(index, controlType)}
                    >
                      {controlNames[controlType]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="control-preview">
        <div><kbd>Ц</kbd><kbd>Ф</kbd><kbd>Ы</kbd><kbd>В</kbd> / <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
        <div><kbd>Н</kbd><kbd>П</kbd><kbd>Р</kbd><kbd>О</kbd> / <kbd>Y</kbd><kbd>G</kbd><kbd>H</kbd><kbd>J</kbd></div>
        <div><kbd>З</kbd><kbd>Д</kbd><kbd>Ж</kbd><kbd>Э</kbd> / <kbd>P</kbd><kbd>L</kbd><kbd>;</kbd><kbd>'</kbd></div>
        <div><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <button className="menu-btn primary" onClick={handleStart}>
        <span>Начать игру</span>
      </button>
      <button className="menu-btn secondary" onClick={onBack}>
        <span>Назад</span>
      </button>

      <div className="instructions">
        <p>Выберите удобную схему управления для каждого игрока</p>
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#adb5bd' }}>
          Пауза: <kbd>Esc</kbd> / <kbd>ё</kbd> / <kbd>`</kbd> • Полный экран: <kbd>C</kbd>
        </p>
      </div>
    </div>
  );
};
