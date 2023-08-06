"use client";

import { useState } from "react";
import { useRoomState } from "./use-game-state";
import { useSendAction } from "./use-send-action";
import { useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

type GuessesProps = {
  roomId: string;
};

export const Guesses: React.FC<GuessesProps> = ({ roomId }) => {
  const [state] = useRoomState(roomId);
  const { mutate: sendAction } = useSendAction(roomId);
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
    <div className="bg-red-100 border rounded-lg p-4 space-y-4">
      <h2 className="text-xl">Guesses</h2>
      <ul className="h-80 overflow-auto">
        {state.currentGame?.guesses.map((guess) => (
          <li
            key={guess.createdAt.toString() + guess.playerName}
          >{`${guess.playerName}: ${guess.guess}`}</li>
        ))}
      </ul>
      <form className="flex space-x-4" onSubmit={handleGuess}>
        <Input
          name="guess"
          type="text"
          className="w-full"
          value={currentGuess}
          onChange={(e) => setCurrentGuess(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};
