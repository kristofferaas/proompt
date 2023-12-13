import { create } from "zustand";

type Player = {
  id: string;
  name: string;
  score: number;
  role: "prompter" | "guesser" | "spectator";
};

type Message = {
  id: string;
  text: string;
  createdAt: number;
  displayName: string;
};

type ProomptState = {
  status: "prompting" | "playing" | "game-over";
  players: Player[];
  addPlayer: (player: Player) => void;
  removePlayer: (player: Player) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  resetMessages: () => void;
  secretWord: string;
  setSecretWord: (secretWord: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  image: string | null;
  setImage: (image: string | null) => void;
};

export const useProompt = create<ProomptState>((set, get) => ({
  status: "game-over",
  players: [],
  addPlayer: (player) => {
    set((state) => ({
      players: [...state.players, player],
    }));
  },
  removePlayer: (player) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== player.id),
    }));
  },
  messages: [],
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  resetMessages: () => {
    set((state) => ({
      messages: [],
    }));
  },
  secretWord: "",
  setSecretWord: (secretWord) => {
    const { status } = get();
    if (status === "prompting") {
      set(() => ({
        status: "playing",
        secretWord,
      }));
    }
  },
  prompt: "",
  setPrompt: (prompt) => {
    set(() => ({
      prompt,
    }));
  },
  image: null,
  setImage: (image) => {
    set(() => ({
      image,
    }));
  },
}));
