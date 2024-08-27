// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import GameBoard from './GameBoard';
import { io } from 'socket.io-client';

const socket = io('https://chess-like-game-backend.onrender.com');  // Update with your server URL

ReactDOM.render(
  <React.StrictMode>
    <GameBoard socket={socket} />
  </React.StrictMode>,
  document.getElementById('root')
);
