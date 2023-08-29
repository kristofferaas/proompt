import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq, InferModel } from "drizzle-orm";
import error from "next/error";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { shuffle, draw, series } from "radash";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = idSchema.parse(searchParams.get("id"));
  if (id == null) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
  });
  if (room == null) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room.state);
}

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
