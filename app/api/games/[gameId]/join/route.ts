import { db } from "@/lib/db";
import { games } from "@/lib/db/schema";
import { reducer } from "@/lib/game/reducer";
import { gameStateSchema } from "@/lib/game/state";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinBodySchema = z.object({
  playerName: z.string(),
});

export const POST = async (
  req: NextRequest,
  { params }: { params: { gameId: string } }
) => {
  const gameId = Number(params.gameId);
  const body = await req.json();

  // Get current game state from db
  const [game] = await db
    .select({
      state: games.state,
    })
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

  // Validate current game state and join body
  const currentGameState = gameStateSchema.parse(game?.state);
  const joinBody = joinBodySchema.parse(body);

  // Check if player name is already taken
  if (
    currentGameState.players.some((p) => p.playerName === joinBody.playerName)
  ) {
    return NextResponse.json(
      {
        message: "Name already taken",
      },
      {
        status: 409,
      }
    );
  }

  // Get next game state after player joins
  const nextGameState = reducer(currentGameState, {
    type: "join",
    payload: {
      playerName: joinBody.playerName,
    },
  });

  // Save next game state to db
  await db
    .update(games)
    .set({ state: nextGameState })
    .where(eq(games.id, gameId));

  return NextResponse.json({
    message: "Joined game",
  });
};
