"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import ScoreTable from "@/components/ScoreTable";
import PointEntryForm from "@/components/PointEntryForm";

export default function GamePage() {
  const { state, hydrated } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !state.gameStarted) {
      router.replace("/");
    }
  }, [hydrated, state.gameStarted, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!state.gameStarted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Continental</h1>
      {state.currentView === "table" ? <ScoreTable /> : <PointEntryForm />}
    </main>
  );
}
