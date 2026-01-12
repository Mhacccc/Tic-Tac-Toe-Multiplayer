import { useState } from "react";
import "./App.css";





function App() {
  const [squares,setSquares] = useState(Array(9).fill(null));
  const [xIsNext,setXIsNext] = useState(true);
  let status = null


  

  function handleClick(index){

    if(squares[index]) return;
    if(winner) return;

    const copySquares = [...squares];
    copySquares[index] = xIsNext?"X":"O";

    setSquares(copySquares)
    setXIsNext(!xIsNext)

  }

  function Square({value,index}){
            
    return (
      <div key={index} className="square" onClick={()=>{handleClick(index)}} >{value}</div>
    )
  }


  function checkWinner(){

    const combinations = [
      [0,1,2],
      [3,4,5],
      [6,7,8],
      [0,3,6],
      [1,4,7],
      [2,5,8],
      [0,4,8],
      [2,4,6],
    ]

    for(let i = 0; i<combinations.length;i++ ){
      const [a,b,c] = combinations[i]
      if(squares[a]&&squares[a] === squares[b] && squares[a] === squares[c]){
        return squares[a];
      }
    }

    return null;
  }

  const winner = checkWinner()

  if(winner){
    status = winner
  }else if(squares.every(Boolean)){
    status = "Draw!"
  }



  return (
    <div className="container">
      <h1>Winner: {winner} </h1>
      <div className="board">
        {squares.map((value,index)=>{
          return (
            <Square key={index} value={value} index={index} />
          )
        })}
      </div>
    </div>

  )
}

export default App;
