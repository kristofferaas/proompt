"use client";

import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { usePartySend } from "./party";
import { useCurrentPlayer, useProompt } from "./useProompt";
import { Button } from "../ui/button";
import { getRandomWords } from "@/lib/words/get-random-words";
import { useMemo } from "react";

export function PickWordStage() {
  const status = useProompt((state) => state.round?.status);
  const player = useCurrentPlayer();
  const send = usePartySend();

  const words = useMemo(() => {
    if (status !== "picking-word") return null;
    return getRandomWords(3);
  }, [status]);

  const handleWordPicked = (word: string) => {
    const message: ClientSentMessage = {
      type: "pick-word",
      word,
    };
    send(message);
  };

  if (status !== "picking-word") return null;

  if (player?.isPrompter) {
    return (
      <div className="container bg-background text-foreground fixed w-full h-full z-50">
        <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
          <h1 className="text-4xl text-center">
            You are the prompter, pick a word!
          </h1>
          {words?.map((word) => (
            <Button
              key={word}
              onClick={() => handleWordPicked(word)}
              className="w-full"
            >
              {word}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">
          {player?.name} is the prompter, wait for them to pick a word!
        </h1>
      </div>
    </div>
  );
}
