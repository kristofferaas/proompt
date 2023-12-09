import { ChatBubble } from "@/components/ui/chat-bubble";

export default function ComponentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <code>Components</code>
      <ChatBubble displayName="Audun" message="Lorem Ipsum" />
      <ChatBubble displayName="Kristoffer" message="Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." />
      <ChatBubble displayName="Magnus" message="." />
    </div>
  );
}