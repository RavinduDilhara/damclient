import type { GameState, Coord } from "../types/gameTypes";

interface BoardProps {
  gameState: GameState | null;
  selected: Coord | null;
  onCellClick: (row: number, col: number, cellValue: string | null) => void;
  playerColor: string | null;
}

function countCapturedPieces(board: (string | null)[][]) {
  let whitePieces = 0;
  let blackPieces = 0;

  // Count current pieces on board
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.toLowerCase() === "w") whitePieces++;
        if (piece.toLowerCase() === "b") blackPieces++;
      }
    }
  }

  // Starting pieces: 12 each
  const whiteCaptured = 12 - blackPieces; // White captured black pieces
  const blackCaptured = 12 - whitePieces; // Black captured white pieces

  return { whiteCaptured, blackCaptured };
}

export function Board({
  gameState,
  selected,
  onCellClick,
  playerColor,
}: BoardProps) {
  if (!gameState) {
    return <div className="status">Waiting for another player...</div>;
  }

  const { whiteCaptured, blackCaptured } = countCapturedPieces(gameState.board);

  // Show lost pieces (pieces that were captured from you)
  // If you're white, show white pieces that black captured (your losses)
  // If you're black, show black pieces that white captured (your losses)
  const isWhitePlayer = playerColor === "w";
  const myLostPieces = isWhitePlayer ? whiteCaptured : blackCaptured;
  const opponentLostPieces = isWhitePlayer ? blackCaptured : whiteCaptured;

  return (
    <div className="board-container">
      {/* Opponent's lost pieces - shown on top */}
      <div className="captured-pieces captured-top">
        <div className="captured-label">Opponent lost:</div>
        <div className="captured-list">
          {Array.from({ length: opponentLostPieces }).map((_, idx) => (
            <div key={idx} className="captured-piece opponent-lost"></div>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="board">
        {gameState.board.map((row, rIdx) => (
          <div key={rIdx} className="board-row">
            {row.map((cell, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              const isSelected =
                selected && selected.row === rIdx && selected.col === cIdx;

              return (
                <div
                  key={cIdx}
                  className={`square ${isDark ? "dark" : "light"} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => onCellClick(rIdx, cIdx, cell)}
                >
                  {cell && (
                    <div
                      className={`piece ${
                        cell.toLowerCase() === "w"
                          ? "white-piece"
                          : "black-piece"
                      } ${cell === cell.toUpperCase() ? "king" : ""}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Your lost pieces (in RED) - shown on bottom */}
      <div className="captured-pieces captured-bottom">
        <div className="captured-label">You lost:</div>
        <div className="captured-list">
          {Array.from({ length: myLostPieces }).map((_, idx) => (
            <div key={idx} className="captured-piece my-lost"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
