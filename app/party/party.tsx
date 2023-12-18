"use client";

import { env } from "@/lib/env";
import {
  ClientSentMessage,
  serverSentMessagesSchema,
} from "@/lib/schema/websocket-schema";
import { usePartySocket } from "partysocket/react";
import { useProompt } from "@/components/proompt/useProompt";
import { createContext, useContext, useEffect } from "react";

export type PartyProps = {
  room: string;
  children: React.ReactNode;
};

const PartyContext = createContext<((message: ClientSentMessage) => void) | null>(null);

export function usePartySend() {
  const send = useContext(PartyContext);

  if (!send) {
    throw new Error("useParty must be used within a Party");
  }

  return send;
}

export function Party({ room, children }: PartyProps) {
  const socket = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room,
    onMessage: handleOnMessage,
  });

  useEffect(() => {
    console.log("socket send updated");
  }, [socket.send]);

  const handleSend = (message: ClientSentMessage) => {
    socket.send(JSON.stringify(message));
  };

  return (
    <PartyContext.Provider value={handleSend}>{children}</PartyContext.Provider>
  );
}

const handleOnMessage = (event: MessageEvent) => {
  const data = serverSentMessagesSchema.parse(JSON.parse(event.data));

  switch (data.type) {
    case "round-started": {
      useProompt.getState().setRound(data.round);
      break;
    }
    case "message-received": {
      useProompt.getState().newMessage(data.message);
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
