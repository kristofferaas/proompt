import { utapi } from "uploadthing/server";

type UploadData = {
  key: string;
  url: string;
  name: string;
  size: number;
};

export async function uploadFile(file: Blob): Promise<UploadData> {
  try {
    console.log("Uploading...");
    const result = await utapi.uploadFiles(file);
    if (result.error) {
      console.log("Upload error");
      console.log(result.error);
      throw new Error("Upload failed");
    } else {
      console.log("WOW!");
      return result.data;
    }
  } catch (e) {
    console.log("Upload error");
    console.log(await e);
    throw e;
  }
}
