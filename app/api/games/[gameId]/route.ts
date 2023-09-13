import { db } from "@/lib/db";
import { games, rooms } from "@/lib/db/schema";
import { actionSchema } from "@/lib/game/action";
import { reducer } from "@/lib/game/reducer";
import { gameStateSchema } from "@/lib/game/state";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Post game action
export const POST = async (
  req: NextRequest,
  { params }: { params: { gameId: string } }
) => {
  const gameId = Number(params.gameId);
  const body = await req.json();

  db.transaction(async (tx) => {
    // Game current game state from db
    const [game] = await tx
      .select({
        state: games.state,
      })
      .from(games)
      .where(eq(games.id, gameId));

    // Validate current game state and player action
    const currentGameState = gameStateSchema.parse(game?.state);
    const playerAction = actionSchema.parse(body);

    // Apply action to get next game state
    const nextGameState = reducer(currentGameState, playerAction);

    // Save next game state to db
    await tx
      .update(rooms)
      .set({ state: nextGameState })
      .where(eq(rooms.id, gameId));
  });
};

// Get current game state
export const GET = async (
  req: NextRequest,
  { params }: { params: { gameId: string } }
) => {
  const gameId = Number(params.gameId);

  // Get current game state from db
  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

  // Validate current game state
  const currentGameState = gameStateSchema.parse(game?.state);

  return NextResponse.json(currentGameState);
};
