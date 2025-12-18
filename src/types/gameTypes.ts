export type PlayerColor = "w" | "b";

export type GameStatus = "waiting" | "playing" | "finished";

export interface Coord {
  row: number;
  col: number;
}

export interface GameState {
  board: (string | null)[][];
  currentPlayer: PlayerColor;
  status: GameStatus;
  winner: PlayerColor | null;
  mustContinueFrom: Coord | null;
}
