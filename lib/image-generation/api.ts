import fs from "fs";
import { z } from "zod";
import { uploadFile } from "../file-storage/api";
import { randomUUID } from "crypto";

const generationResponseSchema = z.object({
  artifacts: z.array(
    z.object({
      base64: z.string(),
      seed: z.number(),
      finishReason: z.string(),
    })
  ),
});

export async function textToImage(
  prompt = "A kitchen appliance that makes heart shaped food similar to pancakes."
): Promise<Blob> {
  // const modelName = "stable-diffusion-xl-1024-v1-0";
  const modelName = "stable-diffusion-512-v2-1";
  const path = `https://api.stability.ai/v1/generation/${modelName}/text-to-image`;

  const promptPrefix =
    "You are a helpful assistant that helps people visualise a concept without using the exact word normally associated with it. Generate a clear image showing the non-mentioned word, using the following description of it:\n";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
  };

  const body = {
    steps: 20,
    width: 512,
    height: 512,
    seed: 0,
    cfg_scale: 6,
    samples: 1,
    text_prompts: [
      {
        text: promptPrefix + prompt,
        weight: 1,
      },
    ],
  };

  const response = await fetch(path, {
    headers,
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Non-200 response: ${await response.text()}`);
  }

  const responseJSON = await response.json();
  const responseParsed = generationResponseSchema.parse(responseJSON);

  const image = responseParsed.artifacts[0];
  if (image === undefined) {
    throw new Error("No image returned from API");
  }
  const binaryString = Buffer.from(image.base64, "base64");
  const blob: any = new Blob([binaryString], { type: "image/png" });
  blob.name = randomUUID() + ".png";
  return blob;
}

export async function generateAndUploadImage(prompt: string, fileName: string) {
  const image = await textToImage(prompt);
  console.log("uploading image");
  const { url } = await uploadFile(image);
  return { imageData: image, imageUrl: url };
}
