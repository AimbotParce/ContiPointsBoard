"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { getWinnerDiscount, isValidScore } from "@/lib/scoring";

export default function PointEntryForm() {
  const { state, dispatch } = useGame();
  const { players, rounds } = state;
  const roundNumber = rounds.length + 1;
  const discount = getWinnerDiscount(roundNumber);

  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of players) {
      initial[p.id] = "";
    }
    return initial;
  });
  const [errors, setErrors] = useState<string[]>([]);

  function updateScore(playerId: string, value: string) {
    setScores((prev) => ({ ...prev, [playerId]: value }));
  }

  function selectWinner(playerId: string) {
    setWinnerId(playerId);
    // Clear winner's score input since it's auto-filled
    setScores((prev) => ({ ...prev, [playerId]: "" }));
  }

  function handleSubmit() {
    const newErrors: string[] = [];

    if (!winnerId) {
      newErrors.push("Select a winner for this round.");
    }

    const finalScores: Record<string, number> = {};

    for (const player of players) {
      if (player.id === winnerId) {
        finalScores[player.id] = discount;
        continue;
      }

      const raw = scores[player.id];
      if (raw === "" || raw === undefined) {
        newErrors.push(`Enter a score for ${player.name}.`);
        continue;
      }

      const num = Number(raw);
      if (isNaN(num)) {
        newErrors.push(`${player.name}: score must be a number.`);
      } else if (!isValidScore(num)) {
        newErrors.push(
          `${player.name}: score must be a positive multiple of 5.`
        );
      } else {
        finalScores[player.id] = num;
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch({ type: "SUBMIT_ROUND", scores: finalScores, winnerId: winnerId! });
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-bold">Round {roundNumber}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Winner gets {discount} points
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {players.map((player) => {
          const isWinner = winnerId === player.id;
          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isWinner
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <button
                type="button"
                onClick={() => selectWinner(player.id)}
                className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                  isWinner
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
                aria-label={`Select ${player.name} as winner`}
              >
                {isWinner ? "W" : ""}
              </button>

              <span className="flex-shrink-0 font-medium min-w-[60px] truncate">
                {player.name}
              </span>

              <input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                value={isWinner ? String(discount) : scores[player.id]}
                onChange={(e) => updateScore(player.id, e.target.value)}
                disabled={isWinner}
                placeholder="0"
                className={`flex-1 min-w-0 px-3 py-2 text-base text-right rounded-lg border ${
                  isWinner
                    ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed`}
              />
            </div>
          );
        })}
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600 dark:text-red-400">
              {err}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => dispatch({ type: "CANCEL_ENTRY" })}
          className="flex-1 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 text-base font-semibold rounded-lg bg-blue-600 text-white active:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
