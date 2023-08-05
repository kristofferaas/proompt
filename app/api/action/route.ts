import { db } from "@/lib/db";
import { actionSchema, reducer } from "@/lib/reducer";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gameStateSchema, roomStateSchema } from "../state/route";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const body = await req.json();
  const action = actionSchema.parse(body);

  await db.transaction(async (tx) => {
    // Get current game state
    const [room] = await tx
      .select({ state: rooms.state })
      .from(rooms)
      .where(eq(rooms.id, Number(id.toString())))
      .for("update")
      .limit(1);

    const prevState = roomStateSchema.parse(room?.state);

    // Apply action to game state
    const nextState = reducer(prevState, action);

    // Save game state
    await tx
      .update(rooms)
      .set({ state: nextState })
      .where(eq(rooms.id, Number(id)));
  });
}
