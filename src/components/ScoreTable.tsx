"use client";

import { useGame } from "@/context/GameContext";
import { calculateTotals, getWinnerDiscount } from "@/lib/scoring";

export default function ScoreTable() {
  const { state, dispatch } = useGame();
  const { players, rounds } = state;
  const currentRound = rounds.length + 1;
  const currentDiscount = getWinnerDiscount(currentRound);
  const totals = calculateTotals(players, rounds);

  const minTotal = Math.min(...Object.values(totals));

  function handleReset() {
    if (window.confirm("Reset the entire game? All scores will be lost.")) {
      dispatch({ type: "RESET_GAME" });
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="sticky left-0 bg-gray-100 px-3 py-3 text-left font-semibold min-w-[70px]">
                Round
              </th>
              <th className="px-2 py-3 text-center font-semibold min-w-[50px]">
                +/-
              </th>
              {players.map((p) => (
                <th
                  key={p.id}
                  className="px-3 py-3 text-center font-semibold min-w-[70px] max-w-[100px] truncate"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map((round) => (
              <tr
                key={round.roundNumber}
                className="border-t border-gray-200"
              >
                <td className="sticky left-0 bg-white px-3 py-2 font-medium">
                  {round.roundNumber}
                </td>
                <td className="px-2 py-2 text-center text-xs text-gray-500">
                  {round.discount}
                </td>
                {players.map((p) => {
                  const score = round.scores[p.id] ?? 0;
                  const isWinner = round.winnerId === p.id;
                  return (
                    <td
                      key={p.id}
                      className={`px-3 py-2 text-center ${
                        isWinner
                          ? "text-green-600 font-semibold"
                          : ""
                      }`}
                    >
                      {score}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Current round placeholder */}
            <tr className="border-t border-dashed border-gray-300 bg-gray-50">
              <td className="sticky left-0 bg-gray-50 px-3 py-2 font-medium text-gray-400">
                {currentRound}
              </td>
              <td className="px-2 py-2 text-center text-xs text-gray-400">
                {currentDiscount}
              </td>
              {players.map((p) => (
                <td
                  key={p.id}
                  className="px-3 py-2 text-center text-gray-300"
                >
                  -
                </td>
              ))}
            </tr>

            {/* Totals */}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="sticky left-0 bg-white px-3 py-3">
                Total
              </td>
              <td></td>
              {players.map((p) => {
                const total = totals[p.id] ?? 0;
                const isLowest = total === minTotal && rounds.length > 0;
                return (
                  <td
                    key={p.id}
                    className={`px-3 py-3 text-center ${
                      isLowest
                        ? "text-green-600 bg-green-50"
                        : ""
                    }`}
                  >
                    {total}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={() => dispatch({ type: "OPEN_POINT_ENTRY" })}
          className="w-full py-4 text-lg font-semibold rounded-lg bg-blue-600 text-white active:bg-blue-700"
        >
          End Round {currentRound}
        </button>
        <button
          onClick={handleReset}
          className="w-full py-3 text-sm rounded-lg border border-gray-300 text-gray-500 active:bg-gray-100"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
