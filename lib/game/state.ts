import { z } from "zod";

const guessSchema = z.object({
  createdAt: z.string(),
  playerName: z.string(),
  guess: z.string(),
});

const playerSchema = z.object({
  playerName: z.string(),
  score: z.number(),
  role: z.enum(["prompter", "guesser", "spectator"]),
});

export const gameStateSchema = z.object({
  players: z.array(playerSchema),
  guesses: z.array(guessSchema),
  prompter: z.string(),
  secretWord: z.string(),
  image: z.string().url().optional(),
});

export type GameState = z.infer<typeof gameStateSchema>;
