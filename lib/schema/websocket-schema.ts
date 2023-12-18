import { z } from "zod";
import { roundSchema } from "./round-schema";
import { messageSchema } from "./message-schema";

// Server sent messages

const roundStartedSchema = z.object({
  type: z.literal("round-started"),
  round: roundSchema,
});

const playerConnectedSchema = z.object({
  type: z.literal("player-connected"),
  player: z.object({
    id: z.string(),
    name: z.string(),
    score: z.number(),
  }),
});

const messageReceivedSchema = z.object({
  type: z.literal("message-received"),
  message: messageSchema,
});

export const serverSentMessagesSchema = z.union([
  roundStartedSchema,
  playerConnectedSchema,
  messageReceivedSchema,
]);

export type ServerSentMessage = z.infer<typeof serverSentMessagesSchema>;

// Client sent messages

const messageSendSchema = z.object({
  type: z.literal("message-send"),
  message: messageSchema,
});

const pickWordSchema = z.object({
  type: z.literal("pick-word"),
  word: z.string(),
});

const promptWordSchema = z.object({
  type: z.literal("prompt-word"),
  prompt: z.string(),
});

const readySchema = z.object({
  type: z.literal("ready"),
});

export const clientSentMessagesSchema = z.union([
  messageSendSchema,
  pickWordSchema,
  promptWordSchema,
  readySchema,
]);

export type ClientSentMessage = z.infer<typeof clientSentMessagesSchema>;
