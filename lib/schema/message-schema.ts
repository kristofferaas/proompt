import { z } from "zod";

const roundStartedSchema = z.object({
  type: z.literal("round-started"),
  round: z.object({
    id: z.number(),
    status: z.enum(["waiting", "playing", "finished"]),
    imageUrl: z.string().nullable(),
    prompt: z.string().nullable(),
    word: z.string().nullable(),
  }),
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
  message: z.string(),
});

export const messageSchema = z.union([
  roundStartedSchema,
  playerConnectedSchema,
  messageReceivedSchema,
]);

export type Message = z.infer<typeof messageSchema>;
