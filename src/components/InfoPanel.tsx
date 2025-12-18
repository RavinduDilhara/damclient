import type { GameState, PlayerColor } from "../types/gameTypes";

interface InfoPanelProps {
  roomId: string;
  playerColor: PlayerColor | null;
  gameState: GameState | null;
  onReset: () => void;
}

function countPieces(board: (string | null)[][], color: "w" | "b") {
  let count = 0;
  let kings = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.toLowerCase() === color) {
        count++;
        if (piece === piece.toUpperCase()) {
          kings++;
        }
      }
    }
  }

  return { total: count, kings, regular: count - kings };
}

export function InfoPanel({
  roomId,
  playerColor,
  gameState,
  onReset,
}: InfoPanelProps) {
  const whitePieces = gameState
    ? countPieces(gameState.board, "w")
    : { total: 0, kings: 0, regular: 0 };
  const blackPieces = gameState
    ? countPieces(gameState.board, "b")
    : { total: 0, kings: 0, regular: 0 };

  return (
    <div className="info">
      <div className="info-top">
        <p className="tag room-tag">
          <span>Room</span> {roomId}
        </p>
        <button className="reset-button" onClick={onReset}>
          Reset game
        </button>
      </div>

      <p className="tag you-tag">
        <span>You are</span>{" "}
        {playerColor === "w" ? "White" : playerColor === "b" ? "Black" : "-"}
      </p>

      {gameState && (
        <>
          <p
            className={`current-turn ${
              gameState.currentPlayer === "w" ? "white-turn" : "black-turn"
            }`}
          >
            Turn: {gameState.currentPlayer === "w" ? "White" : "Black"}
          </p>

          <div className="pieces-counter">
            <div className="counter-section white-counter">
              <div className="counter-header">
                <div className="counter-piece white-piece-icon"></div>
                <span className="counter-label">White</span>
              </div>
              <div className="counter-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{whitePieces.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Regular:</span>
                  <span className="stat-value">{whitePieces.regular}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Kings:</span>
                  <span className="stat-value king-count">
                    {whitePieces.kings}
                  </span>
                </div>
              </div>
            </div>

            <div className="counter-divider"></div>

            <div className="counter-section black-counter">
              <div className="counter-header">
                <div className="counter-piece black-piece-icon"></div>
                <span className="counter-label">Black</span>
              </div>
              <div className="counter-stats">
                <div className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{blackPieces.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Regular:</span>
                  <span className="stat-value">{blackPieces.regular}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Kings:</span>
                  <span className="stat-value king-count">
                    {blackPieces.kings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
