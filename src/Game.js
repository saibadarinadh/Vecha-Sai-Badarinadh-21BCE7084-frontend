// Game.js
import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';

const Game = ({ socket }) => {
  // Assuming you need to keep track of the board and player turn
  const [gameState, setGameState] = useState({
    board: Array(5).fill(Array(5).fill(null)),
    currentPlayer: 'A',
  });

  useEffect(() => {
    socket.on('gameState', (newState) => {
      setGameState(newState);
    });

    socket.on('invalidMove', (message) => {
      alert(message);
    });

    socket.on('gameOver', (winner) => {
      alert(`Game Over! Player ${winner} wins!`);
    });

    return () => {
      socket.off('gameState');
      socket.off('invalidMove');
      socket.off('gameOver');
    };
  }, [socket]);

  return (
    <div>
      <GameBoard
        board={gameState.board}
        currentPlayer={gameState.currentPlayer}
        socket={socket}
      />
    </div>
  );
};

export default Game;
