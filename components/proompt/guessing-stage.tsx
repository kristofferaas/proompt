"use client";

import { useState } from "react";
import { usePartySend } from "./party";
import { useCurrentPlayer, useProompt } from "./useProompt";
import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { ChatBubble } from "../ui/chat-bubble";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonalIcon } from "lucide-react";

export function GuessingStage() {
  const status = useProompt((state) => state.round?.status);

  if (status !== "guessing") return null;

  return (
    <div className="container h-screen max-w-xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="hidden lg:flex items-center">
        <GeneratedImage />
      </div>
      <div className="h-screen">
        <Chat />
      </div>
    </div>
  );
}

function GeneratedImage() {
  const imageUrl = useProompt((state) => state.round?.imageUrl);

  return (
    <div className="w-full aspect-square rounded-lg bg-primary overflow-hidden">
      {imageUrl && (
        <img src={imageUrl} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

function Chat() {
  const messages = useProompt((state) => state.messages);
  const send = usePartySend();
  const player = useCurrentPlayer();

  const [guess, setGuess] = useState("");
  const handleGuess: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!guess) return;
    const clientMessage: ClientSentMessage = {
      type: "guess",
      guess,
    };
    send(clientMessage);
    setGuess("");
  };

  return (
    <div className="h-full flex flex-col">
      <ol className="flex flex-1 flex-col py-4 gap-4 overflow-auto">
        {messages.map((message, index) => (
          <ChatBubble
            key={message.ts}
            displayName={message.player}
            message={message.text}
            side={index % 7 ? "left" : "right"}
          />
        ))}
      </ol>
      <form className="py-4 flex gap-2 bg-background" onSubmit={handleGuess}>
        <Input
          disabled={player?.isPrompter}
          placeholder="Guess the word"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <Button
          disabled={player?.isPrompter}
          type="submit"
          size="icon"
          className="shrink-0"
        >
          <SendHorizonalIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
