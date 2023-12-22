import { z } from "zod";

export const roundSchema = z.object({
  // Unique ID of the round
  id: z.number(),
  // Current status of the round
  status: z.enum([
    "waiting",
    "picking-word",
    "prompting",
    "generating",
    "guessing",
    "finished",
  ]),
  // URL of the generated image
  imageUrl: z.string().nullable(),
  // Prompt that the prompter is given
  prompt: z.string().nullable(),
  // Word that the prompter is trying to get the guesser to guess
  word: z.string().nullable(),
  // Player ID of the prompter
  prompter: z.string().nullable(),
  // Scores each player has earned this round
  // Key is the player ID, value is the score
  scores: z.record(z.string(), z.number()).nullable(),
});

export type Round = z.infer<typeof roundSchema>;
