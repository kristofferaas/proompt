import { claimName } from "@/lib/auth";
import { db } from "@/lib/db";
import { commit } from "@/lib/game/commit";
import { reducer } from "@/lib/game/reducer";
import { rooms } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createBody = z.object({
  playerName: z.string()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { playerName } = createBody.parse(body);

  // Call reducer with no state to get initial state
  const initialState = reducer();

  // Insert initial room state
  const [room] = await db
    .insert(rooms)
    .values({
      state: initialState,
    })
    .returning();

  if (!room) {
    return NextResponse.error();
  }

  const token = await claimName(playerName, room.id, initialState);
  if (!token) {
    return NextResponse.json(
      {
        error: "Name already taken",
      },
      { status: 409 }
    );
  }

  await commit(
    room.id,
    {
      type: "join",
      payload: {
        player: playerName,
      },
    },
    token
  );

  return NextResponse.json(
    {
      id: room.id,
      state: room.state,
    },
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict;`,
      },
    }
  );
}
