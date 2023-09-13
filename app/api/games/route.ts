import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { createGameState } from "@/lib/game/create-game-state";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Create new game state
  const state = createGameState();

  // Insert game state into db
  const [game] = await db
    .insert(games)
    .values({
      state,
    })
    .returning();

  if (!game) {
    return NextResponse.error();
  }

  return NextResponse.json(
    {
      id: game.id,
      state: game.state,
    },
    {
      status: 200,
    }
  );
}
