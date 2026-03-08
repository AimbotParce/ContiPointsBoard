"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { GameState, GameAction } from "@/types/game";
import { getWinnerDiscount } from "@/lib/scoring";
import { loadGameState, saveGameState } from "@/lib/storage";

const initialState: GameState = {
  players: [],
  rounds: [],
  currentView: "table",
  gameStarted: false,
};

let nextId = 1;

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_PLAYER":
      return {
        ...state,
        players: [
          ...state.players,
          { id: String(nextId++), name: action.name },
        ],
      };
    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.id),
      };
    case "START_GAME":
      return { ...state, gameStarted: true, currentView: "table" };
    case "OPEN_POINT_ENTRY":
      return { ...state, currentView: "pointEntry" };
    case "CANCEL_ENTRY":
      return { ...state, currentView: "table" };
    case "SUBMIT_ROUND": {
      const roundNumber = state.rounds.length + 1;
      const discount = getWinnerDiscount(roundNumber);
      const scores = { ...action.scores, [action.winnerId]: discount };
      return {
        ...state,
        rounds: [
          ...state.rounds,
          {
            roundNumber,
            scores,
            winnerId: action.winnerId,
            discount,
          },
        ],
        currentView: "table",
      };
    }
    case "RESET_GAME":
      return { ...initialState };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  hydrated: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      // Ensure nextId doesn't collide with existing player IDs
      const maxId = saved.players.reduce(
        (max, p) => Math.max(max, Number(p.id) || 0),
        0
      );
      nextId = maxId + 1;
      dispatch({ type: "HYDRATE", state: saved });
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveGameState(state);
    }
  }, [state, hydrated]);

  return (
    <GameContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
