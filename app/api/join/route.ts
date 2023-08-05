import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinBody = z.object({
  id: z.coerce.number(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id } = joinBody.parse(body);
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
  });
  
  if (!room) {
    return NextResponse.json({
      error: "Room not found",
    }, {status: 404});
  }
  return NextResponse.json({
    room,
  });
}
