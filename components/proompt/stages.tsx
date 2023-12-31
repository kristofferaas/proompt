"use client";

import { FinishedStage } from "@/components/proompt/finished-stage";
import { GeneratingImageStage } from "@/components/proompt/generating-image-stage";
import { GuessingStage } from "@/components/proompt/guessing-stage";
import { PickWordStage } from "@/components/proompt/pick-word-stage";
import { PromptStage } from "@/components/proompt/prompt-stage";
import { useProompt } from "@/components/proompt/useProompt";
import { WaitingStage } from "@/components/proompt/waiting-stage";

export function Stages() {
  const status = useProompt((state) => state.round?.status);

  if (!status) return null;

  switch (status) {
    case "waiting":
      return <WaitingStage />;
    case "picking-word":
      return <PickWordStage />;
    case "prompting":
      return <PromptStage />;
    case "generating":
      return <GeneratingImageStage />;
    case "guessing":
      return <GuessingStage />;
    case "finished":
      return <FinishedStage />;
    default:
      return <code>Error</code>;
  }
}
