import { z } from "zod";

const guessSchema = z.object({
  type: z.literal("guess"),
  guess: z.string(),
});

const pickWordSchema = z.object({
  type: z.literal("pick-word"),
  word: z.string(),
});

const promptWordSchema = z.object({
  type: z.literal("prompt-word"),
  prompt: z.string(),
});

const readySchema = z.object({
  type: z.literal("ready"),
});

const joinSchema = z.object({
  type: z.literal("join"),
  name: z.string(),
});

export const clientSentMessagesSchema = z.union([
  guessSchema,
  pickWordSchema,
  promptWordSchema,
  readySchema,
  joinSchema,
]);

export type ClientSentMessage = z.infer<typeof clientSentMessagesSchema>;
