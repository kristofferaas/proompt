import { utapi } from "uploadthing/server";

export async function uploadFile(file: Blob) {
  try {
    console.log("Uploading...");
    const result = await utapi.uploadFiles(file);
    if (result.error) {
      console.log("Upload error");
      console.log(result.error);
      throw new Error("Upload failed");
    } else {
      console.log("WOW!");
    }
  } catch (e) {
    console.log("Upload error");
    console.log(await e);
  }
}
