"use client";

import { useEffect, useRef, useState } from "react";
import { usePartySend } from "./party";
import { useCurrentPlayer, useMessages, useProompt } from "./useProompt";
import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { ChatBubble } from "../ui/chat-bubble";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonalIcon } from "lucide-react";
import { useMediaQuery } from "../ui/use-media-query";
import { useVirtualizer } from "@tanstack/react-virtual";

export function GuessingStage() {
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (isMobile) {
    return (
      <div className="fixed h-dvh w-full bg-background flex flex-col">
        <div className="h-16 flex justify-center items-center">
          <CountdownTimer />
        </div>
        <div className="bg-secondary h-[calc(100%-4rem)] flex flex-col rounded-t-lg overflow-hidden">
          <ChatLog />
          <GuessForm />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh max-w-2xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 mx-8">
      <div className="hidden lg:flex flex-col justify-center items-center gap-8">
        <CountdownTimer />
        <GeneratedImage />
      </div>
      <div className="flex flex-col bg-secondary rounded-lg overflow-hidden w-[512px]">
        <ChatLog />
        <GuessForm />
      </div>
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
  );
}

function ChatLog() {
  const messages = useMessages();

  const listRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 45,
    overscan: 2,
    paddingStart: 16,
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (messages.length) {
      virtualizer.scrollToIndex(messages.length - 1);
    }
  }, [messages, virtualizer]);

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

function CountdownTimer() {
  const guessTimeInSeconds = useProompt((state) => state.round?.guessTime || 0);

  const [timeLeft, setTimeLeft] = useState(guessTimeInSeconds);

  useEffect(() => {
    if (!guessTimeInSeconds) return;
    setTimeLeft(guessTimeInSeconds);
  }, [guessTimeInSeconds]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <span className="text-xl lg:text-3xl">
      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
    </span>
  );
}
