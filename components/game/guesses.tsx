"use client";

import { SendHorizonalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useGameState } from "./use-game-state";
import { useSendAction } from "./use-send-action";

type GuessesProps = {
  roomId: string;
  player?: string;
};

export const Guesses: React.FC<GuessesProps> = ({ roomId, player }) => {
  const [state] = useGameState(roomId);
  const { mutate: sendAction } = useSendAction(roomId);
  const [currentGuess, setCurrentGuess] = useState("");

  function handleGuess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedGuess = currentGuess.trim();
    if (trimmedGuess.length === 0) {
      return;
    }
    if (!player) {
      return;
    }
    sendAction({
      type: "guess",
      payload: { guess: trimmedGuess, player },
    });
    setCurrentGuess("");
  }

  const guessesRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (guessesRef.current) {
      guessesRef.current.scrollTo({ top: guessesRef.current.scrollHeight });
    }
  }, [state.guesses]);

  return (
    <div className="bg-red-100 border rounded-lg p-4 space-y-4">
      <h2 className="text-xl">Guesses</h2>
      <ul ref={guessesRef} className="h-80 overflow-hidden">
        {state.guesses.map((guess, index) => (
          <li key={index}>{`${guess.playerName}: ${guess.guess}`}</li>
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
        <Button type="submit" disabled={!player}>
          Guess
          <SendHorizonalIcon className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </div>
  );
};
