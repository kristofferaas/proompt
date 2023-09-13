import { generateAndUploadImage } from "@/lib/image-generation/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await generateAndUploadImage(
    "A kitchen appliance that makes Belgian-Norwegian pancakes, where the pancakes are in the shape of five hearts in a circle.",
    "test.png"
  );
  return NextResponse.json({ success: true });
}
