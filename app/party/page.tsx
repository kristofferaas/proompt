import { z } from "zod";
import { Party } from "./party";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Input } from "@/components/ui/input";
import { SendHorizonalIcon } from "lucide-react";

const searchParamsSchema = z.object({
  room: z.string(),
});

export default function PartyPage({ searchParams }: { searchParams: unknown }) {
  const { room } = searchParamsSchema.parse(searchParams);

  return (
    <Party room={room}>
      <div className="container max-w-6xl flex flex-1 justify-evenly gap-8">
        <div className="hidden lg:block w-[480px] h-[480px] aspect-square bg-primary sticky top-1/2 -translate-y-1/2 rounded-[16px]" />
        <Chat />
      </div>
    </Party>
  );
}
function Chat() {
  return (
    <div className="w-[480px]">
      <ol className="flex flex-col py-4 gap-4">
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble
          side="right"
          displayName="Kristoffer"
          message="Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        />
        <ChatBubble
          displayName="Audun"
          message="Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        />
        <ChatBubble displayName="🤖 Proompt" message="Audun was close" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble
          side="right"
          displayName="Kristoffer"
          message="Lorem Ipsum"
        />
        <ChatBubble displayName="Audun" message="Lorem Ipsum" />
        <ChatBubble displayName="🤖 Proompt" message="Audun was close" />
      </ol>
      <div className="py-4 flex gap-2 sticky bottom-0 bg-background">
        <Input placeholder="Guess the secret word" />
        <Button size="icon" className="shrink-0">
          <SendHorizonalIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
