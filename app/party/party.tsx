"use client";

import { env } from "@/lib/env";
import { messageSchema } from "@/lib/schema/message-schema";
import { usePartySocket } from "partysocket/react";

export type PartyProps = {
  room: string;
  children: React.ReactNode;
};

export function Party({ room, children }: PartyProps) {
  usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room,
    onMessage: handleOnMessage,
  });

  return <>{children}</>;
}

const handleOnMessage = (event: MessageEvent) => {
  const data = messageSchema.parse(JSON.parse(event.data));

  switch (data.type) {
    case "round-started": {
      console.log("round started", data);
      break;
    }
    case "message-received": {
      console.log("ping");
      break;
    }
    case "player-connected": {
      console.log("player connected", data);
      break;
    }
    default: {
      console.log("unhandled message", data);
    }
  }
};
