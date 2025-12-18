import { useEffect, useState, useRef, type FormEvent } from "react";
import { io, type Socket } from "socket.io-client";
import "./App.css";
import { JoinForm } from "./components/JoinForm";
import { InfoPanel } from "./components/InfoPanel";
import { Board } from "./components/Board";
import type { Coord, GameState, PlayerColor } from "./types/gameTypes";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

function App() {
  const socketRef = useRef<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [connected, setConnected] = useState(false);
  const [playerColor, setPlayerColor] = useState<PlayerColor | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<Coord | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [resetRequest, setResetRequest] = useState<{
    fromPlayer: string;
    requesterId: string;
  } | null>(null);

  useEffect(() => {
    const s: Socket = io(SOCKET_URL);
    socketRef.current = s;

    s.on("connect", () => {
      console.log("Connected to server");
    });

    s.on(
      "joinedRoom",
      (payload: { playerColor: PlayerColor; gameState: GameState }) => {
        const { playerColor, gameState } = payload;
        setPlayerColor(playerColor);
        setGameState({ ...gameState });
        setConnected(true);
      }
    );

    s.on("gameUpdate", (game: GameState) => {
      setGameState({ ...game });
    });

    s.on("roomFull", () => {
      alert("Room is full (only 2 players allowed). Choose another Room ID.");
    });

    s.on("invalidMove", () => {
      setWarningMessage("Invalid move");
      setTimeout(() => setWarningMessage(""), 3000);
    });

    s.on("mustCapture", (payload: { message: string }) => {
      setWarningMessage(payload.message);
      setTimeout(() => setWarningMessage(""), 3000);
    });

    s.on("playerLeft", () => {
      alert("Opponent left. Waiting for another player...");
    });

    s.on(
      "resetRequest",
      (payload: { fromPlayer: string; requesterId: string }) => {
        setResetRequest(payload);
      }
    );

    s.on("resetConfirmed", () => {
      setResetRequest(null);
      setSuccessMessage("Game has been reset!");
      setTimeout(() => setSuccessMessage(""), 3000);
    });

    s.on("resetDeclined", () => {
      setWarningMessage("Opponent declined the reset request");
      setTimeout(() => setWarningMessage(""), 3000);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!socket || !roomId) return;
    socket.emit("joinRoom", { roomId, name });
  };

  const handleCellClick = (
    row: number,
    col: number,
    cellValue: string | null
  ) => {
    if (!gameState || gameState.status !== "playing") return;
    if (!playerColor) return;
    const socket = socketRef.current;
    if (!socket) return;

    const isMyTurn = gameState?.currentPlayer === playerColor;
    if (!isMyTurn) return;

    const must = gameState?.mustContinueFrom as Coord | null;

    // During a capture chain, you must keep using the same piece
    if (must) {
      // Don't allow deselecting the chain piece
      if (selected && selected.row === row && selected.col === col) {
        return;
      }
    }

    const myPiece = playerColor; // 'w' or 'b'
    const isMyPiece = cellValue && cellValue.toLowerCase() === myPiece;

    if (!selected) {
      if (isMyPiece) {
        setSelected({ row, col });
      }
      return;
    }

    // Deselect only when not in a capture chain
    if (!must && selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    socket.emit("makeMove", {
      roomId,
      from: { row: selected.row, col: selected.col },
      to: { row, col },
    });

    // Selection will be re-set by gameUpdate when mustContinueFrom is present
    setSelected(null);
  };

  const handleReset = () => {
    const socket = socketRef.current;
    if (!socket || !roomId) return;
    socket.emit("resetGame", { roomId });
  };

  const handleResetResponse = (accepted: boolean) => {
    const socket = socketRef.current;
    if (!socket || !roomId || !resetRequest) return;

    socket.emit("resetResponse", {
      roomId,
      accepted,
      requesterId: resetRequest.requesterId,
    });

    setResetRequest(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dam Arena</h1>
        <p className="app-subtitle">
          Play real-time online dam/checkers with a friend in a private room.
        </p>
      </header>

      {!connected ? (
        <main className="home-shell">
          <section className="home-hero">
            <h2 className="home-heading">Jump, capture, and crown your king</h2>
            <p className="home-tagline">
              Create a room, share the code, and battle it out on a modern
              multiplayer dam board.
            </p>
            <ul className="home-points">
              <li>Instant real-time moves with Socket.IO</li>
              <li>Private 1 vs 1 rooms – just share the room ID</li>
              <li>Smart multi-jump captures and king promotion</li>
            </ul>
          </section>

          <section className="home-card">
            <h3 className="home-card-title">Start a match</h3>
            <p className="home-card-sub">
              Pick a name and room ID. If the room doesn&apos;t exist yet,
              we&apos;ll create it for you.
            </p>
            <JoinForm
              name={name}
              roomId={roomId}
              onNameChange={setName}
              onRoomIdChange={setRoomId}
              onSubmit={handleJoin}
            />
          </section>
        </main>
      ) : (
        <main className="game-shell">
          {warningMessage && (
            <div className="warning-banner">
              <span className="warning-icon">⚠️</span>
              {warningMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-banner">
              <span className="success-icon">✓</span>
              {successMessage}
            </div>
          )}

          {resetRequest && (
            <div className="confirmation-modal">
              <div className="confirmation-content">
                <h3>Reset Game?</h3>
                <p>
                  {resetRequest.fromPlayer === "w" ? "White" : "Black"} player
                  wants to reset the game. Do you agree?
                </p>
                <div className="confirmation-buttons">
                  <button
                    className="confirm-yes"
                    onClick={() => handleResetResponse(true)}
                  >
                    Yes, Reset
                  </button>
                  <button
                    className="confirm-no"
                    onClick={() => handleResetResponse(false)}
                  >
                    No, Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          <section className="game-left">
            <Board
              gameState={gameState}
              selected={selected}
              onCellClick={handleCellClick}
              playerColor={playerColor}
            />
          </section>
          <section className="game-right">
            <InfoPanel
              roomId={roomId}
              playerColor={playerColor}
              gameState={gameState}
              onReset={handleReset}
            />
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
