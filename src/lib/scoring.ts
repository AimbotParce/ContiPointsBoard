import { Player, RoundResult } from "@/types/game";

export function getWinnerDiscount(roundNumber: number): number {
  return -(roundNumber + 1) * 10;
}

export function isValidScore(value: number): boolean {
  return value >= 0 && value % 5 === 0;
}

export function calculateTotals(
  players: Player[],
  rounds: RoundResult[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const player of players) {
    totals[player.id] = rounds.reduce(
      (sum, round) => sum + (round.scores[player.id] ?? 0),
      0
    );
  }
  return totals;
}
