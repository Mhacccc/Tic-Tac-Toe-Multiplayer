import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import Square from "./components/Square";
import Chat from "./components/Chat"; // Import Chat component
import {io} from "socket.io-client"

const socket = io.connect(import.meta.env.VITE_SERVER_URL || "http://localhost:4000")

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [playerRole, setPlayerRole] = useState(null);
  const [gameState, setGameState] = useState("idle"); // idle, searching, playing, opponent_left

  const winInfo = useMemo(() => calculateWinner(squares), [squares]);
  const winner = winInfo ? winInfo.winner : null;
  const winningLine = winInfo ? winInfo.line : [];

  const isFull = squares.every(Boolean);

  let status;
  if (gameState === "idle") {
    status = "Press 'Find Game' to start";
  } else if (gameState === "searching") {
    status = "Searching for opponent...";
  } else if (gameState === "opponent_left") {
    status = "Opponent left the game";
  } else if (winner) {
    status = "Winner: " + winner;
  } else if (isFull) {
    status = "Draw!";
  } else {
    status = (xIsNext ? "X" : "O")+"'s turn";
  }

  const handleReset = useCallback(() => {
    if (gameState === "playing" || winner || isFull) {
      socket.emit("reset");
    }
  }, [gameState, winner, isFull]);

  const handleSearch = useCallback(() => {
    socket.emit("search_game");
    setGameState("searching");
  }, []);

  const handleClick = useCallback((index) => {
    if (gameState !== "playing") return;
    if (squares[index] || winner) return;

    if (playerRole !== (xIsNext ? "X" : "O")) return;
    
    const copySquares = [...squares];
    copySquares[index] = xIsNext ? "X" : "O";

    setSquares(copySquares);
    setXIsNext(!xIsNext);
    socket.emit("clicked",copySquares,!xIsNext)
  }, [gameState, squares, winner, playerRole, xIsNext]);

  useEffect(()=>{

    const onConsole = (val,turn)=>{
      setSquares(val)
      setXIsNext(turn)
    }

    const onGameStart = ({ role }) => {
      setPlayerRole(role);
      setGameState("playing");
      setSquares(Array(9).fill(null));
      setXIsNext(true);
    }

    const onWaiting = () => {
      setGameState("searching");
    }

    const onOpponentLeft = () => {
      setGameState("opponent_left");
      setPlayerRole(null);
    }

    const onReset = () => {
      setSquares(Array(9).fill(null));
      setXIsNext(true);
    }

    socket.on("console", onConsole)
    socket.on("game_start", onGameStart)
    socket.on("waiting", onWaiting)
    socket.on("opponent_left", onOpponentLeft)
    socket.on("reset", onReset)

    return () => {
      socket.off("console", onConsole)
      socket.off("game_start", onGameStart)
      socket.off("waiting", onWaiting)
      socket.off("opponent_left", onOpponentLeft)
      socket.off("reset", onReset)
    }
  },[])                                                                                                                              

  return (
    <div className="container">
      <div className="header">
        <h1>Tic Tac Toe</h1>
        <div className="status-bar">{status}</div>
        {gameState === "playing" && playerRole && <div className="role-badge">You are: <span>{playerRole}</span></div>}
      </div>
      
      <div className="game-container">
        <div className="board">
          {squares.map((value, index) => {
            return (
              <Square
                key={index}
                value={value}
                isWinning={winningLine.includes(index)}
                onSquareClick={() => handleClick(index)}
              />
            );
          })}
        </div>
        {gameState === "playing" && <Chat socket={socket} playerRole={playerRole} />}
      </div>

      {(gameState === "idle" || gameState === "opponent_left") && (
        <button className="reset-btn" onClick={handleSearch}>
          Find Game
        </button>
      )}

      {gameState === "playing" && (winner || isFull) && (
        <button className="reset-btn" onClick={handleReset}>
          Play Again
        </button>
      )}
    </div>
  );
}

export default App;
