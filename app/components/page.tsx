import { ChatBubble } from "@/components/ui/chat-bubble";

export default function ComponentsPage() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <ChatBubble displayName="Audun" message="Lorem Ipsum" />
      <ChatBubble
        side="right"
        displayName="Kristoffer"
        message="Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
      />
      <ChatBubble displayName="Audun" message="Lorem Ipsum" />
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
      <ChatBubble side="right" displayName="Kristoffer" message="Lorem Ipsum" />
      <ChatBubble displayName="Audun" message="Lorem Ipsum" />
      <ChatBubble displayName="🤖 Proompt" message="Audun was close" />
    </div>
  );
}
