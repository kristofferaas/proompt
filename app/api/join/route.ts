import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { RoomState, roomStateSchema } from "../state/route";
import { SignJWT } from "jose";
import { env } from "@/lib/env";

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

const claimName = async (name: string, roomCode: number, state: RoomState) => {
  const nameTaken = state.players.some((player) => player.name === name);

  if (nameTaken) {
    return null;
  }

  return new SignJWT({ name, roomCode })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(env.SECRET));
};
