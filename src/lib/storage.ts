import { GameState } from "@/types/game";

const STORAGE_KEY = "contipoints-game";

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
