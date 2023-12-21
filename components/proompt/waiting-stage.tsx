"use client";

import { Button } from "../ui/button";
import { usePartySend } from "./party";
import { useProompt } from "./useProompt";

export function WaitingStage() {
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
