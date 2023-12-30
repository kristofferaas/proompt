"use client";

import { useRef, useState } from "react";
import { usePartySend } from "./party";
import { useCurrentPlayer, useProompt } from "./useProompt";
import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { ChatBubble } from "../ui/chat-bubble";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonalIcon } from "lucide-react";
import { useMediaQuery } from "../ui/use-media-query";
import { useVirtualizer } from "@tanstack/react-virtual";

export function GuessingStage() {
  const status = useProompt((state) => state.round?.status);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (status !== "guessing") return null;

  if (isMobile) {
    return (
      <div className="h-dvh w-full bg-blue-100 flex flex-col">
        <MobileChat />
        <GuessForm />
      </div>
    );
  }

  return (
    <div className="h-dvh max-w-2xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 mx-8">
      <div className="hidden lg:flex items-center">
        <GeneratedImage />
      </div>
      <Chat />
    </div>
  );
}

function GeneratedImage() {
  const imageUrl = useProompt((state) => state.round?.imageUrl);

  return (
    <div className="w-[512px] aspect-square rounded-lg bg-primary overflow-hidden">
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
    <div className="flex flex-col bg-secondary rounded-lg overflow-hidden w-[512px]">
      <ol className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
        {messages.map((message, index) => (
          <ChatBubble
            key={message.ts}
            displayName={message.player}
            message={message.text}
            side={index % 7 ? "left" : "right"}
          />
        ))}
      </ol>
      <form className="flex gap-2 p-4" onSubmit={handleGuess}>
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

function GuessForm() {
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
    <form className="bg-red-100 flex gap-2 p-4" onSubmit={handleGuess}>
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
  );
}

function MobileChat() {
  const messages = useProompt((state) => state.messages);

  const listRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 45,
    overscan: 5,
    paddingStart: 16,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div ref={listRef} className="w-full h-full overflow-y-auto">
      <div
        className="w-full relative"
        style={{
          height: virtualizer.getTotalSize(),
        }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {items.map((virtualRow) => {
            const message = messages[virtualRow.index];
            if (!message) return null;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="pb-4 px-4"
              >
                <ChatBubble
                  displayName={message.player}
                  message={message.text}
                  side="left"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
