"use client";

import Image from "next/image";
import { useGameState } from "./use-game-state";
import { Claims } from "@/lib/auth";
import { useSendAction } from "./use-send-action";
import { useState } from "react";

export function PromptStage({ claims }: { claims: Claims }) {
  const [state] = useGameState(claims.gameId.toString());
  const { mutate: sendAction } = useSendAction(claims.gameId.toString());
  const [prompt, setPrompt] = useState("");
  if (state.prompter !== claims.name) return null;
  if (state.image != null) return null;

  const handleWordSelected = (word: string) => {
    sendAction({ type: "select-word", payload: { word } });
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sendAction({ type: "prompt", payload: { prompt } });
    setPrompt("");
  };

  const renderWord = (word: string) => {
    return (
      <div
        key={word}
        className="bg-blue-400 hover:bg-blue-600 rounded-full text-center text-2xl p-2 cursor-pointer"
        onClick={() => handleWordSelected(word)}
      >
        {word}
      </div>
    );
  };

  if (state.secretWord === null) {
    return (
      <div className="border-b rounded-lg overflow-hidden bg-blue-100 w-[512px] h-[512px] shrink-0 flex flex-col">
        <p className="text-center text-2xl">Choose a word</p>
        <div className="flex flex-row gap-3">
          {state.availableWords.map(renderWord)}
        </div>
      </div>
    );
  } else {
    return (
      <form
        className="border-b rounded-lg overflow-hidden bg-blue-100 w-[512px] h-[512px] shrink-0 flex flex-col"
        onSubmit={handlePromptSubmit}
      >
        <p className="text-center text-2xl">
          Your word is: {state.secretWord}.
        </p>
        <p>Please describe it to the other players:</p>
        <textarea
          className="border rounded-lg p-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="border rounded-lg p-2 bg-blue-400 hover:bg-blue-600">
          Send
        </button>
      </form>
    );
  }
}
