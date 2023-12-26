import { z } from "zod";
import { roundSchema } from "./round-schema";
import { messageSchema } from "./message-schema";
import { playerSchema } from "./player-schema";

const roundUpdateSchema = z.object({
  type: z.literal("round-update"),
  round: roundSchema,
});

const playerUpdateSchema = z.object({
  type: z.literal("player-update"),
  players: playerSchema.array(),
});

const messageReceivedSchema = z.object({
  type: z.literal("message-received"),
  message: messageSchema,
});

const invalidPromptMessageSchema = z.object({
  type: z.literal("invalid-prompt"),
  message: z.string(),
});

export const serverSentMessagesSchema = z.union([
  roundUpdateSchema,
  playerUpdateSchema,
  messageReceivedSchema,
  invalidPromptMessageSchema,
]);

export type ServerSentMessage = z.infer<typeof serverSentMessagesSchema>;
