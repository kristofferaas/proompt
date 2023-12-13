"use client";

import { useProompt } from "@/components/proompt/useProompt";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Input } from "@/components/ui/input";
import { SendHorizonalIcon } from "lucide-react";
import { useState } from "react";

export default function ComponentsPage() {
  return (
    <>
      <PrompterStage />
      <GameOverStage />
      <div className="container h-screen max-w-xl lg:max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hidden lg:flex items-center">
          <GeneratedImage />
        </div>
        <div className="h-screen">
          <Chat />
        </div>
      </div>
    </>
  );
}

function GameOverStage() {
  const status = useProompt((state) => state.status);

  if (status !== "game-over") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">
          Audun guessed the word!
        </h1>
      </div>
    </div>
  );
}

function PrompterStage() {
  const status = useProompt((state) => state.status);
  // const currentPlayer = useCurrentPlayer();
  // const isPrompter = currentPlayer?.isPrompter;
  // TODO: show waiting message if not prompter

  const handleWordPicked = (word: string) => {
    const { setSecretWord } = useProompt.getState();
    setSecretWord(word);
  };

  if (status !== "prompting") return null;

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
  return (
    <div className="w-full aspect-square rounded-lg bg-primary">
      <img
        src="https://picsum.photos/seed/picsum/512/512"
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
}

function Chat() {
  const messages = useProompt((state) => state.messages);

  const [guess, setGuess] = useState("");
  const handleGuess: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!guess) return;
    const { addMessage } = useProompt.getState();
    addMessage({
      id: Date.now().toString(),
      createdAt: Date.now(),
      displayName: "You",
      text: guess,
    });
    setGuess("");
  };

  return (
    <div className="h-full flex flex-col">
      <ol className="flex flex-1 flex-col py-4 gap-4 overflow-auto">
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            displayName={message.displayName}
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
