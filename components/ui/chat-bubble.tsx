export type ChatBubbleProps = {
  displayName: string;
  message: string;
};

export function ChatBubble({ displayName, message }: ChatBubbleProps) {
  return (
    <div>
      <span className="text-foreground text-[12px] pl-3">{displayName}</span>
      <div className="relative bg-primary text-primary-foreground py-1 px-3 w-fit min-w-[28px] min-h-[32px] rounded-[16px]">
        <ChatBubbleTail className="absolute bottom-0 left-0 text-primary" />
        <div className="relative">
          <p className="font-normal text-[16px] leading-normal bg-inherit">
            {message}
          </p>
        </div>
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
