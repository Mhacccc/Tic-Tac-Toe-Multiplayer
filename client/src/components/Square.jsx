import { memo } from "react";

function Square({ value, onSquareClick, isWinning }) {
  return (
    <div className={`square ${value ? value.toLowerCase() : ""} ${isWinning ? "winning" : ""}`} onClick={onSquareClick}>
      {value}
    </div>
  );
}

export default memo(Square);