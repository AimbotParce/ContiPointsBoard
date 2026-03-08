export interface Player {
  id: string;
  name: string;
}

export interface RoundResult {
  roundNumber: number;
  scores: Record<string, number>;
  winnerId: string;
  discount: number;
}

export interface GameState {
  players: Player[];
  rounds: RoundResult[];
  currentView: "table" | "pointEntry";
  gameStarted: boolean;
}

export type GameAction =
  | { type: "ADD_PLAYER"; name: string }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "START_GAME" }
  | { type: "OPEN_POINT_ENTRY" }
  | { type: "SUBMIT_ROUND"; scores: Record<string, number>; winnerId: string }
  | { type: "CANCEL_ENTRY" }
  | { type: "RESET_GAME" }
  | { type: "HYDRATE"; state: GameState };
