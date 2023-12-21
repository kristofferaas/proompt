import { ProomptDevTools } from "@/components/proompt/dev-tools";
import { FinishedStage } from "@/components/proompt/finished-stage";
import { GeneratingImageStage } from "@/components/proompt/generating-image-stage";
import { GuessingStage } from "@/components/proompt/guessing-stage";
import { PickWordStage } from "@/components/proompt/pick-word-stage";
import { PromptStage } from "@/components/proompt/prompt-stage";
import { WaitingStage } from "@/components/proompt/waiting-stage";
import { Party } from "../../components/proompt/party";

export default function ComponentsPage() {
  return (
    <Party room="yeet">
      <ProomptDevTools />
      <WaitingStage />
      <PickWordStage />
      <PromptStage />
      <GeneratingImageStage />
      <GuessingStage />
      <FinishedStage />
    </Party>
  );
}
