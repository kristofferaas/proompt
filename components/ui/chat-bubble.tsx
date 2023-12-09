import { cn } from "@/lib/utils";

export type ChatBubbleProps = {
  displayName: string;
  message: string;
  side?: "left" | "right";
};

export function ChatBubble({
  displayName,
  message,
  side = "left",
}: ChatBubbleProps) {
  return (
    <div
      className={cn("flex flex-col", {
        "items-end": side === "right",
      })}
    >
      <span className="text-foreground text-[12px] px-3">{displayName}</span>
      <div className="relative bg-primary text-primary-foreground py-1 px-3 w-fit min-w-[28px] max-w-[300px] min-h-[32px] rounded-[16px]">
        <ChatBubbleTail
          className={cn(`absolute bottom-0 text-primary`, {
            "right-0 -scale-x-100": side === "right",
            "left-0": side === "left",
          })}
        />
        <p className="relative font-normal text-[16px] leading-normal bg-inherit">
          {message}
        </p>
      </div>
    </div>
  );
}
function ChatBubbleTail({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="currentColor"
    >
      <path d="M0 15C6 9.375 5.03454 6.09375 4.03454 0H15C15 2.8125 12 12.1875 0 15Z" />
    </svg>
  );
}
