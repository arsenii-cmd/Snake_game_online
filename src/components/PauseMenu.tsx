import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onMainMenu }) => {
  return (
    <div className="pause-menu active">
      <h2>Пауза</h2>
      <div className="pause-menu-buttons">
        <button className="pause-menu-btn" onClick={onResume}>
          <span>Продолжить</span>
        </button>
        <button className="pause-menu-btn secondary" onClick={onMainMenu}>
          <span>Главное меню</span>
        </button>
      </div>
    </div>
  );
};
