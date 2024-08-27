import React, { useState, useEffect } from 'react';
import './GameBoard.css';

function GameBoard() {
    const [gameState, setGameState] = useState(null);
    const [ws, setWs] = useState(null);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [direction, setDirection] = useState('F');
    const [moveHistory, setMoveHistory] = useState([]);
    const [characterType, setCharacterType] = useState(null);

    useEffect(() => {
        const socket = new WebSocket('wss://chess-like-game-backend.onrender.com/');

        setWs(socket);

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            if (message.event === 'gameStateUpdate') {
                setGameState(message.data);
            } else if (message.event === 'invalidMove') {
                alert(`Invalid move: ${message.message}`);
            } else if (message.event === 'gameOver') {
                alert(`Game Over! Player ${message.winner} wins!`);
                resetGame();
            }
        };

        return () => socket.close();
    }, []);

    const resetGame = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            setMoveHistory([]);
            setSelectedCharacter(null);
            setDirection('F');
    
            ws.send(JSON.stringify({ event: 'resetGame' }));
    
            setTimeout(() => {
                ws.send(JSON.stringify({ event: 'requestGameState' }));
            }, 100);
        } else {
            console.error("WebSocket is not open. Cannot reset the game.");
        }
    };
    

    const handleMove = () => {
        if (ws && selectedCharacter) {
            ws.send(JSON.stringify({ event: 'playerMove', data: { character: selectedCharacter, direction } }));
    
            const newMove = {
                character: selectedCharacter,
                direction,
                captured: false
            };
            setMoveHistory(prevHistory => [...prevHistory, newMove]);
        }
    };
    const getMoveCommands = (characterType) => {
        switch (characterType) {
            case 'Pawn':
            case 'Hero1':
                return ['L', 'R', 'F', 'B'];
            case 'Hero2':
                return ['FL', 'FR', 'BL', 'BR'];
            default:
                return [];
        }
    };
    
    
    

    const handleCharacterSelect = (character) => {
        setSelectedCharacter(character.name);
    };

    const handleCellClick = (rowIndex, cellIndex) => {
        if (gameState && gameState.board[rowIndex][cellIndex]) {
            const character = gameState.board[rowIndex][cellIndex];
            if (character.player === gameState.currentPlayer) {
                setSelectedCharacter(character.name); 
                setCharacterType(character.type); 
            }
        }
    };
    
    
    
    
    

    const renderBoard = () => {
        if (!gameState || !gameState.board) return null;
    
        return (
            <div className="board">
                {gameState.board.map((row, rowIndex) =>
                    row.map((cell, cellIndex) => (
                        <div
                            key={`${rowIndex}-${cellIndex}`}
                            onClick={() => handleCellClick(rowIndex, cellIndex)}
                            className={`board-cell ${cell ? 'occupied' : ''} ${selectedCharacter === (cell ? cell.name : '') ? 'selected' : ''}`}
                        >
                            {cell ? <div>{cell.name}</div> : null}
                        </div>
                    ))
                )}
            </div>
        );
    };
    
    
    
    

    const renderMoveHistory = () => {
        return (
            <div className="move-history">
                <h3>Move History:</h3>
                <ul>
                    {moveHistory.map((move, index) => (
                        <li key={index} style={{ color: move.captured ? 'red' : 'black' }}>
                            {move.character}: {move.direction}
                            {move.captured ? ` (Captured ${move.capturedCharacter})` : ''}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="game-container">
            <div>Current Player: {gameState ? gameState.currentPlayer : 'Loading...'}</div>
            {renderBoard()}
            <div className="controls">
            <label>
    Select Character:
    <select
        onChange={(e) => setSelectedCharacter(e.target.value)}
        value={selectedCharacter || ''}
    >
        <option value="">--Select--</option>
        {gameState && gameState.players[gameState.currentPlayer]?.characters.map((character) => (
            <option key={character.name} value={character.name}>
                {character.name}
            </option>
        ))}
    </select>
</label>



                <label>
                    Direction:
                    <select onChange={(e) => setDirection(e.target.value)} value={direction}>
                        <option value="F">Forward</option>
                        <option value="B">Backward</option>
                        <option value="L">Left</option>
                        <option value="R">Right</option>
                        <option value="FL">Forward-Left</option>
                        <option value="FR">Forward-Right</option>
                        <option value="BL">Backward-Left</option>
                        <option value="BR">Backward-Right</option>
                    </select>
                </label>
                <button onClick={handleMove}>Move</button>
                <button onClick={resetGame}>Reset Game</button>
            </div>
            {renderMoveHistory()}
        </div>
    );
}

export default GameBoard;
