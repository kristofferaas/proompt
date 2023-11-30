import { z } from "zod";

const guessSchema = z.object({
  createdAt: z.string(),
  playerName: z.string(),
  guess: z.string(),
});

const playerSchema = z.object({
  playerName: z.string(),
  score: z.number(),
});

export const gameStateSchema = z.object({
  players: z.array(playerSchema),
  guesses: z.array(guessSchema),
  prompter: z.string().nullable(),
  availableWords: z.array(z.string()),
  secretWord: z.string().nullable(),
  image: z.string().url().nullable(),
  roundExpiresAt: z.coerce.date().nullable(),
});

export type GameState = z.infer<typeof gameStateSchema>;
