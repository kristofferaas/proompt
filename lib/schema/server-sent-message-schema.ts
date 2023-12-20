import { z } from "zod";
import { roundSchema } from "./round-schema";
import { messageSchema } from "./message-schema";
import { playerSchema } from "./player-schema";

const roundStartedSchema = z.object({
  type: z.literal("round-started"),
  round: roundSchema,
});

const presenceSchema = z.object({
  type: z.literal("presence"),
  players: playerSchema.array(),
});

const messageReceivedSchema = z.object({
  type: z.literal("message-received"),
  message: messageSchema,
});

export const serverSentMessagesSchema = z.union([
  roundStartedSchema,
  presenceSchema,
  messageReceivedSchema,
]);

export type ServerSentMessage = z.infer<typeof serverSentMessagesSchema>;