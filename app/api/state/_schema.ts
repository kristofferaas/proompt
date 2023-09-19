import type { rooms } from "@/lib/schema";
import type { InferModel } from "drizzle-orm";
import { z } from "zod";

type PlayerState = {
  name: string;
  score: number;
};

export const playerStateSchema = z.object({
  name: z.string(),
  score: z.number(),
});

export const gameStateSchema = z.object({
  availableSecretWords: z.array(z.string()),
  secretWord: z.string().nullable(),
  currentPrompterPlayer: z.string(),
  prompterPlayerQueue: z.array(z.string()),
  generatedImageUrl: z.string().nullable(),
  guesses: z.array(
    z.object({
      createdAt: z.coerce.date(),
      playerName: z.string(),
      guess: z.string(),
    })
  ),
});

// type GameState = {
//   availableSecretWords: string[];
//   secretWord: string | null;
//   currentPrompterPlayer: string;
//   prompterPlayerQueue: string[];
//   generatedImageUrl: string | null;
//   guesses: { createdAt: Date; playerName: string; guess: string }[];
// };
export type GameState = z.infer<typeof gameStateSchema>;

export const roomStateSchema = z.object({
  players: z.array(playerStateSchema),
  currentGame: gameStateSchema.nullable(),
});

export type RoomCode = InferModel<typeof rooms>["id"];

export type RoomState = z.infer<typeof roomStateSchema>;
