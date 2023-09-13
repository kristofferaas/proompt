import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq, InferModel } from "drizzle-orm";
import error from "next/error";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { shuffle, draw, series } from "radash";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = idSchema.parse(searchParams.get("id"));
  if (id == null) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
  });
  if (room == null) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room.state);
}
