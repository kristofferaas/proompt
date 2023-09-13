import { z } from "zod";

const createGameActionSchema = z.object({
  type: z.literal("create-game"),
  payload: z.object({
    // TODO: Add game options
  }),
});

const joinGameActionSchema = z.object({
  type: z.literal("join"),
  payload: z.object({
    playerName: z.string(),
  }),
});

const leaveGameActionSchema = z.object({
  type: z.literal("leave"),
  payload: z.object({
    player: z.string(),
  }),
});

const guessActionSchema = z.object({
  type: z.literal("guess"),
  payload: z.object({
    player: z.string(),
    guess: z.string(),
  }),
});

export const actionSchema = z.union([
  createGameActionSchema,
  joinGameActionSchema,
  leaveGameActionSchema,
  guessActionSchema,
]);

export type Action = z.infer<typeof actionSchema>;
