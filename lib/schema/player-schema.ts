import { z } from "zod";

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  ready: z.boolean(),
});

export type Player = z.infer<typeof playerSchema>;
