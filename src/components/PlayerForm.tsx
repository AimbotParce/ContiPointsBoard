"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";

export default function PlayerForm() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState("");
  const router = useRouter();

  function addPlayer() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: "ADD_PLAYER", name: trimmed });
    setName("");
  }

  function startGame() {
    dispatch({ type: "START_GAME" });
    router.push("/game");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          placeholder="Player name"
          className="flex-1 min-w-0 px-4 py-3 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          onClick={addPlayer}
          disabled={!name.trim()}
          className="px-5 py-3 text-base font-medium rounded-lg bg-blue-600 text-white disabled:opacity-40 active:bg-blue-700"
        >
          Add
        </button>
      </div>

      {state.players.length > 0 && (
        <ul className="flex flex-col gap-2">
          {state.players.map((player, i) => (
            <li
              key={player.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-100"
            >
              <span className="text-base">
                {i + 1}. {player.name}
              </span>
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_PLAYER", id: player.id })
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 active:bg-gray-300"
                aria-label={`Remove ${player.name}`}
              >
                X
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={startGame}
        disabled={state.players.length < 2}
        className="w-full py-4 text-lg font-semibold rounded-lg bg-green-600 text-white disabled:opacity-40 active:bg-green-700"
      >
        Start Game ({state.players.length} players)
      </button>
    </div>
  );
}
