import React from 'react';
import { Player } from '../types/game';

interface GameOverProps {
  players: Player[];
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ players, onRestart }) => {
  const alivePlayers = players.filter(p => p.snake.alive);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  let winner = 'Ничья';
  if (alivePlayers.length > 0) {
    const aliveHumans = alivePlayers.filter(p => p.type === 'human');
    if (aliveHumans.length > 0) {
      winner = aliveHumans.length === 1 
        ? `Игрок ${players.indexOf(aliveHumans[0]) + 1}` 
        : 'Игроки победили!';
    } else {
      winner = 'Боты победили!';
    }
  }

  return (
    <div className="game-over active">
      <div className="game-over-content">
        <h2>Игра окончена!</h2>
        <p>Победитель: <span className="winner">{winner}</span></p>
        <div className="final-scores">
          {sortedPlayers.map((player, index) => {
            const name = player.type === 'bot' 
              ? `Бот ${players.indexOf(player) + 1}` 
              : `Игрок ${players.indexOf(player) + 1}`;
            
            return (
              <div key={index} style={{ color: player.snake.color.head }}>
                {name}{player.snake.alive ? ' (жив)' : ''}: {player.score}
              </div>
            );
          })}
        </div>
        <button onClick={onRestart}>
          <span>Играть снова</span>
        </button>
      </div>
    </div>
  );
};
