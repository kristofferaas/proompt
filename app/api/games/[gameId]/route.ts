import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { actionSchema } from "@/lib/game/action";
import { gameStateSchema } from "@/lib/game/state";
import { getGameStore } from "@/lib/game/store";
import sideEffect from "@/lib/side-effects";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Post game action
export const POST = async (
  req: NextRequest,
  { params }: { params: { gameId: string } }
) => {
  try {
    const gameId = Number(params.gameId);
    const body = await req.json();
    const playerAction = actionSchema.parse(body);

    const gameStore = getGameStore(gameId);
    gameStore.dispatch(playerAction);
    sideEffect(gameStore, playerAction);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};

// Get current game state
export const GET = async (
  req: NextRequest,
  { params }: { params: { gameId: string } }
) => {
  try {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};
