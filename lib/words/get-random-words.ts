import { WORD_LIST } from "./word-list";

export function getRandomWords(count: number): readonly string[] {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    if (!word) {
      i--;
      continue;
    }
    if (words.includes(word)) {
      i--;
      continue;
    }
    words.push(word);
  }
  return words;
}
