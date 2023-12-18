"use client";

import { useProompt } from "@/components/proompt/useProompt";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Input } from "@/components/ui/input";
import { SendHorizonalIcon } from "lucide-react";
import { useState } from "react";
import { Party, usePartySend } from "../party/party";
import { ClientSentMessage } from "@/lib/schema/websocket-schema";

export default function ComponentsPage() {
  return (
    <Party room="yeet">
      <WaitingStage />
      <PickWordStage />
      <PromptStage />
      <GeneratingImageStage />
      <GuessingStage />
      <GameOverStage />
    </Party>
  );
}

function WaitingStage() {
  const status = useProompt((state) => state.round?.status);
  const send = usePartySend();

  const handleReady = () => {
    send({
      type: "ready",
    });
  };

  if (status !== "waiting") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">Are you ready?</h1>
        <Button onClick={handleReady}>Ready</Button>
      </div>
    </div>
  );
}

function GameOverStage() {
  const status = useProompt((state) => state.round?.status);
  const send = usePartySend();

  const handleReady = () => {
    send({
      type: "ready",
    });
  };

  if (status !== "finished") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">Audun guessed the word!</h1>
        <Button onClick={handleReady}>Ready</Button>
      </div>
    </div>
  );
}

function GuessingStage() {
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

function GeneratingImageStage() {
  const status = useProompt((state) => state.round?.status);

  if (status !== "generating") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">Generating image...</h1>
      </div>
    </div>
  );
}

function PromptStage() {
  const status = useProompt((state) => state.round?.status);
  const send = usePartySend();

  const [prompt, setPrompt] = useState("");

  const handlePrompt = () => {
    const message: ClientSentMessage = {
      type: "prompt-word",
      prompt,
    };
    send(message);
  };

  // TODO: show waiting message if not prompter

  if (status !== "prompting") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">Prompt the word!</h1>
        <Input
          placeholder="Prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handlePrompt}>Submit</Button>
      </div>
    </div>
  );
}

function PickWordStage() {
  const status = useProompt((state) => state.round?.status);
  const send = usePartySend();
  // const currentPlayer = useCurrentPlayer();
  // const isPrompter = currentPlayer?.isPrompter;
  // TODO: show waiting message if not prompter

  const handleWordPicked = (word: string) => {
    const message: ClientSentMessage = {
      type: "pick-word",
      word,
    };
    send(message);
  };

  if (status !== "picking-word") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">
          You are the prompter, pick a word!
        </h1>
        <Button onClick={() => handleWordPicked("Pizza")}>Pizza</Button>
        <Button onClick={() => handleWordPicked("Burger")}>Burger</Button>
        <Button onClick={() => handleWordPicked("Pasta")}>Pasta</Button>
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

  const [guess, setGuess] = useState("");
  const handleGuess: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!guess) return;
    const clientMessage: ClientSentMessage = {
      type: "message-send",
      message: {
        text: guess,
        ts: Date.now(),
        player: "Audun",
      },
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
          placeholder="Guess the word"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
        />
        <Button type="submit" size="icon" className="shrink-0">
          <SendHorizonalIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
