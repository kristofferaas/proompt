"use client";

import { useState } from "react";
import { usePartySend } from "./party";
import { useCurrentPlayer, usePrompter, useProompt } from "./useProompt";
import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function PromptStage() {
  const status = useProompt((state) => state.round?.status);
  const prompter = usePrompter();
  const player = useCurrentPlayer();
  const send = usePartySend();

  const [prompt, setPrompt] = useState("");

  const handlePrompt = () => {
    const message: ClientSentMessage = {
      type: "prompt-word",
      prompt,
    };
    send(message);
  };

  const promptLog = useProompt((state) =>
    state.logs.find((log) => log.type === "invalid-prompt")
  );

  if (status !== "prompting") return null;

  if (player?.isPrompter) {
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
          {promptLog && (
            <p className="text-center text-red-500">{promptLog.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">
          {prompter?.name} is the prompter, wait for them to prompt!
        </h1>
      </div>
    </div>
  );
}
