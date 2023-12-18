import { z } from "zod";

export const messageSchema = z.object({
  ts: z.number(),
  text: z.string(),
  player: z.string(),
});

export type Message = z.infer<typeof messageSchema>;
