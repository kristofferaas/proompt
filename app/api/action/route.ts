import { commit } from "@/lib/game/commit";
import { actionSchema } from "@/lib/game/reducer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const body = await req.json();
  const action = actionSchema.parse(body);
  await commit(Number(id), action);
  return NextResponse.json({
    message: "Action committed",
  });
}
