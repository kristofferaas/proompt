"use client";
import { useRoomState } from "@/components/game/useGameState";
import { useSendAction } from "@/components/game/useSendAction";
import { useQuery } from "@tanstack/react-query";
import { get } from "http";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const gameRoomParamsSchema = z.object({
  gameId: z.string(),
});

export default function GameRoom({ params }: { params: unknown }) {
  const { gameId } = gameRoomParamsSchema.parse(params);
  const [state] = useRoomState(gameId);
  const { mutate: sendAction } = useSendAction(gameId);
  const [currentGuess, setCurrentGuess] = useState("");
  const searchParams = useSearchParams();

  function handleGuess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedGuess = currentGuess.trim();
    if (trimmedGuess.length === 0) {
      return;
    }
    const playerName = searchParams.get("name");
    if (playerName === null) {
      return;
    }
    sendAction({
      type: "guess",
      payload: { player: playerName, guess: trimmedGuess },
    });
    setCurrentGuess("");
  }

  return (
    <main className="container max-w-4xl bg-red-100">
      <h1>Proompt</h1>
      <div>
        <h2>Players</h2>
        <ul>
          {state.players.map((player) => (
            <li key={player.name}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Guesses</h2>
        <ul>
          {state.currentGame?.guesses.map((guess) => (
            <li
              key={guess.createdAt.toString()}
            >{`${guess.playerName}: ${guess.guess}`}</li>
          ))}
        </ul>
        <form onSubmit={handleGuess}>
          <input
            name="guess"
            type="text"
            className="w-full"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </main>
  );
}
