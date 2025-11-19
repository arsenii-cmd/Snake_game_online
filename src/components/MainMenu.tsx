import React from 'react';
import '../styles/menu.css';

interface MainMenuProps {
  onOfflineMode: () => void;
  onMultiplayerMode: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOfflineMode, onMultiplayerMode }) => {
  return (
    <div className="menu-screen">
      <h2>Выберите режим игры</h2>
      <div className="menu-buttons">
        <button className="menu-btn primary" onClick={onOfflineMode}>
          <span>🎮 Офлайн игра</span>
        </button>
        <button className="menu-btn secondary" onClick={onMultiplayerMode}>
          <span>🌐 Мультиплеер</span>
        </button>
      </div>
      <div className="instructions">
        <p><strong>Офлайн:</strong> Играйте локально до 8 игроков на одном устройстве</p>
        <p><strong>Мультиплеер:</strong> Создайте комнату и играйте с друзьями онлайн</p>
      </div>
    </div>
  );
};
