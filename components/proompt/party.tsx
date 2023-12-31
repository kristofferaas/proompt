"use client";

import { env } from "@/lib/env";
import { serverSentMessagesSchema } from "@/lib/schema/server-sent-message-schema";
import { usePartySocket } from "partysocket/react";
import { useProompt } from "@/components/proompt/useProompt";
import { createContext, useCallback, useContext, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ClientSentMessage } from "@/lib/schema/client-sent-message-schema";
import { useRouter } from "next/navigation";

export type PartyProps = {
  room: string;
  children: React.ReactNode;
};

const PartyContext = createContext<
  ((message: ClientSentMessage) => void) | null
>(null);

export function usePartySend() {
  const send = useContext(PartyContext);

  if (!send) {
    throw new Error("useParty must be used within a Party");
  }

  return send;
}

export function Party({ room, children }: PartyProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const socket = usePartySocket({
    host: env.NEXT_PUBLIC_PARTYKIT_HOST,
    room,
    // attach the token to PartyKit in the query string
    query: async () => ({
      // get an auth token using your authentication client library
      token: await getToken(),
    }),
    onMessage: handleOnMessage,
    onError: () => {
      router.push(`/party?error=connection-failed`);
    },
  });

  const handleSend = useCallback(
    (message: ClientSentMessage) => {
      socket.send(JSON.stringify(message));
    },
    [socket]
  );

  const { user } = useUser();
  let message: ClientSentMessage | null = null;
  if (user) {
    message = {
      type: "join",
      name: user.username ?? "Anonymous",
    };
  }

  useEffect(() => {
    if (message) {
      handleSend(message);
    }
  }, [handleSend, message]);

  return (
    <PartyContext.Provider value={handleSend}>{children}</PartyContext.Provider>
  );
}

const handleOnMessage = (event: MessageEvent) => {
  const data = serverSentMessagesSchema.parse(JSON.parse(event.data));

  switch (data.type) {
    case "round-update": {
      useProompt.getState().setRound(data.round);
      break;
    }
    case "message-received": {
      useProompt.getState().newMessage(data.message);
      break;
    }
    case "player-update": {
      useProompt.getState().setPlayers(data.players);
      break;
    }
    case "invalid-prompt": {
      // Prompt is invalid, so we need to get a new one
      useProompt.getState().addLog({
        type: "invalid-prompt",
        message: "Prompt is invalid, so we need to get a new one",
      });
      break;
    }
    default: {
      console.log("unhandled message", data);
    }
  }
};
