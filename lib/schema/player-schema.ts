import { z } from "zod";

export const playerSchema = z.object({
  // Player ID
  id: z.string(),
  // Player name
  name: z.string(),
  // Total player score
  score: z.number(),
  // Player is ready to start the game
  ready: z.boolean(),
  // Player guessed the correct word timestamp
  guessedAt: z.number().nullable(),
});

export type Player = z.infer<typeof playerSchema>;
