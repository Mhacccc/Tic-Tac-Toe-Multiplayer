import { useState } from "react";
import "./App.css";
import Square from "./components/Square";


// 1. Move helper components and functions outside App


function checkWinner(squares) {
  const combinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (let i = 0; i < combinations.length; i++) {
    const [a, b, c] = combinations[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = checkWinner(squares);
  let status;

  // 2. Fix status logic to display correct text
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(Boolean)) {
    status = "Draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function handleClick(index) {
    if (squares[index] || winner) return;

    const copySquares = [...squares];
    copySquares[index] = xIsNext ? "X" : "O";

    setSquares(copySquares);
    setXIsNext(!xIsNext);
  }

  return (
    <div className="container">
      <h1>{status}</h1>
      <div className="board">
        {squares.map((value, index) => {
          return (
            <Square
              key={index}
              value={value}
              onSquareClick={() => handleClick(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
