import fs from "node:fs";
export function convertFileToJsonArray(filePath: string) {
  // Read the file
  let text = fs.readFileSync(filePath, "utf8");

  // Split the text by newline character to get an array of lines
  let lines = text.split("\n");

  // Trim each line to remove leading and trailing white spaces
  lines = lines.map((line) => line.trim());

  // Filter out any empty lines
  lines = lines.filter((line) => line !== "");

  return lines;
}
