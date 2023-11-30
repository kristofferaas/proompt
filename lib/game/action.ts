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

const selectWordSchema = z.object({
  type: z.literal("select-word"),
  payload: z.object({
    word: z.string(),
  }),
});

const promptActionSchema = z.object({
  type: z.literal("prompt"),
  payload: z.object({
    prompt: z.string(),
  }),
});

const imageGeneratedActionSchema = z.object({
  type: z.literal("image-generated"),
  payload: z.object({
    image: z.string(),
  }),
});

export const actionSchema = z.union([
  createGameActionSchema,
  joinGameActionSchema,
  leaveGameActionSchema,
  guessActionSchema,
  promptActionSchema,
  imageGeneratedActionSchema,
  selectWordSchema,
]);

export type Action = z.infer<typeof actionSchema>;
