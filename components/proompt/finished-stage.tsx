"use client";

import { useMemo } from "react";
import { Button } from "../ui/button";
import { ChatBubble } from "../ui/chat-bubble";
import { usePartySend } from "./party";
import { usePlayers, useProompt } from "./useProompt";

export function FinishedStage() {
  const round = useProompt((state) => state.round);
  const players = usePlayers();
  const send = usePartySend();

  const handleReady = () => {
    send({
      type: "ready",
    });
  };

  const word = round?.word ?? "";
  const prompt = round?.prompt ?? "";

  const playersWithScores = useMemo(() => {
    if (!round?.scores) return [];
    return Object.entries(round.scores)
      .map(([id, score]) => ({
        name: players.find((player) => player.id === id)?.name ?? "Anonymous",
        score,
      }))
      .sort((a, b) => b.score - a.score);
  }, [players, round]);

  if (round?.status !== "finished") return null;

  if (round?.scores) {
    return (
      <div className="container bg-background text-foreground fixed w-full h-full z-50">
        <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
          <h1 className="text-xl text-center">
            The word was {word}, and the prompt given was &quot;{prompt}&quot;
          </h1>
          <ul className="flex flex-col gap-2">
            {playersWithScores.map((player) => (
              <ChatBubble
                key={player.name}
                displayName={player.name}
                message={`Score: ${player.score}`}
              />
            ))}
          </ul>
          <Button onClick={handleReady}>Ready</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">No scores</h1>
        <Button onClick={handleReady}>Ready</Button>
      </div>
    </div>
  );
}
