import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinBody = z.object({
  code: z.string(),
});

export async function POST(req: NextRequest) {
  const res = await req.json();
  const { code } = joinBody.parse(res);
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.code, code),
  });
  
  if (!room) {
    return NextResponse.json({
      error: "Room not found",
    });
  }
  return NextResponse.json({
    room,
  });
}
