"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import PlayerForm from "@/components/PlayerForm";

export default function Home() {
  const { state, hydrated } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && state.gameStarted) {
      router.replace("/game");
    }
  }, [hydrated, state.gameStarted, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (state.gameStarted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Continental</h1>
      <p className="text-gray-500 mb-6 text-center">
        Add the players for this game
      </p>
      <PlayerForm />
    </main>
  );
}
