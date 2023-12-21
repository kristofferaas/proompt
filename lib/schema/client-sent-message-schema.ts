import { z } from "zod";

const guessSchema = z.object({
  type: z.literal("guess"),
  guess: z.string(),
});

export type Guess = z.infer<typeof guessSchema>;

const pickWordSchema = z.object({
  type: z.literal("pick-word"),
  word: z.string(),
});

export type PickWord = z.infer<typeof pickWordSchema>;

const promptWordSchema = z.object({
  type: z.literal("prompt-word"),
  prompt: z.string(),
});

export type PromptWord = z.infer<typeof promptWordSchema>;

const readySchema = z.object({
  type: z.literal("ready"),
});

const joinSchema = z.object({
  type: z.literal("join"),
  name: z.string(),
});

export type Join = z.infer<typeof joinSchema>;

export const clientSentMessagesSchema = z.union([
  guessSchema,
  pickWordSchema,
  promptWordSchema,
  readySchema,
  joinSchema,
]);

export type ClientSentMessage = z.infer<typeof clientSentMessagesSchema>;
