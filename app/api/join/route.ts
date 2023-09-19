import { claimName } from "@/lib/auth";
import { db } from "@/lib/db";
import { commit } from "@/lib/game/commit";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { roomStateSchema } from "../state/_schema";

const joinBody = z.object({
  roomCode: z.coerce.number(),
  name: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomCode, name } = joinBody.parse(body);
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomCode),
  });

  if (!room) {
    return NextResponse.json(
      {
        error: "Room not found",
      },
      { status: 404 }
    );
  }

  const state = roomStateSchema.parse(room.state);
  const token = await claimName(name, roomCode, state);

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
        player: name,
      },
    },
    token
  );

  return NextResponse.json(
    {
      room,
    },
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Strict;`,
      },
    }
  );
}
