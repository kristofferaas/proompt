import { generateAndUploadImage } from "@/lib/image-generation/api";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// TODO: Only for fun, remove later
// Example use: http://localhost:3000/api/generate-image?prompt=The%20round%20metal%20plate%20with%20handle%20that%20you%20put%20on%20a%20stove%20to%20cook%20eggs%20and%20other%20food
export async function GET(req: NextRequest, res: NextResponse) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  console.log("Generating image for prompt: " + prompt);
  const { imageUrl } = await generateAndUploadImage(
    prompt ||
      "A kitchen appliance that makes Belgian-Norwegian pancakes, where the pancakes are in the shape of five hearts in a circle.",
    randomUUID() + ".png"
  );
  return NextResponse.json({ imageUrl });
}
