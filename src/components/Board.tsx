import type { GameState, Coord } from "../types/gameTypes";

interface BoardProps {
  gameState: GameState | null;
  selected: Coord | null;
  onCellClick: (row: number, col: number, cellValue: string | null) => void;
  playerColor: string | null;
  onGameEnd?: (winner: string) => void;
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
  const whiteCaptured = 12 - blackPieces; // White captured black pieces (black's losses)
  const blackCaptured = 12 - whitePieces; // Black captured white pieces (white's losses)

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

  // whiteCaptured = how many black pieces were captured (black's losses)
  // blackCaptured = how many white pieces were captured (white's losses)

  // Determine which side is which based on player color
  // White player sees: Black lost (top), White lost (bottom)
  // Black player sees: White lost (top), Black lost (bottom)
  const isWhitePlayer = playerColor === "w";

  const topLabel = "opponent lost:";
  const topLostCount = isWhitePlayer ? whiteCaptured : blackCaptured;

  const bottomLabel = "you lost:";
  const bottomLostCount = isWhitePlayer ? blackCaptured : whiteCaptured;

  // Flip the board for black player
  const boardToDisplay = isWhitePlayer
    ? gameState.board
    : [...gameState.board].reverse().map((row) => [...row].reverse());

  return (
    <div className="board-container">
      {/* Top side - Opponent's losses */}
      <div className="captured-pieces captured-top">
        <div className="captured-label">{topLabel}</div>
        <div className="captured-list">
          {topLostCount > 0 ? (
            Array.from({ length: topLostCount }).map((_, idx) => (
              <div key={idx} className="captured-piece lost-piece-top"></div>
            ))
          ) : (
            <span className="no-captures">None</span>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className="board">
        {boardToDisplay.map((row, rIdx) => {
          // Calculate actual row index based on perspective
          const actualRowIdx = isWhitePlayer
            ? rIdx
            : gameState.board.length - 1 - rIdx;

          return (
            <div key={rIdx} className="board-row">
              {row.map((cell, cIdx) => {
                // Calculate actual col index based on perspective
                const actualColIdx = isWhitePlayer
                  ? cIdx
                  : row.length - 1 - cIdx;
                const isDark = (actualRowIdx + actualColIdx) % 2 === 1;
                const isSelected =
                  selected &&
                  selected.row === actualRowIdx &&
                  selected.col === actualColIdx;

                return (
                  <div
                    key={cIdx}
                    className={`square ${isDark ? "dark" : "light"} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() =>
                      onCellClick(actualRowIdx, actualColIdx, cell)
                    }
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
          );
        })}
      </div>

      {/* Bottom side - Your losses */}
      <div className="captured-pieces captured-bottom">
        <div className="captured-label">{bottomLabel}</div>
        <div className="captured-list">
          {bottomLostCount > 0 ? (
            Array.from({ length: bottomLostCount }).map((_, idx) => (
              <div key={idx} className="captured-piece lost-piece"></div>
            ))
          ) : (
            <span className="no-captures">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
