import { Message } from "@/lib/schema/message-schema";
import { Round } from "@/lib/schema/round-schema";
import { create } from "zustand";

type Player = {
  id: string;
  name: string;
  score: number;
  role: "prompter" | "guesser" | "spectator";
};

type ProomptState = {
  round: Round | null;
  setRound: (round: Round) => void;
  messages: Message[];
  newMessage: (message: Message) => void;
};

export const useProompt = create<ProomptState>((set) => ({
  round: null,
  setRound: (round) => {
    set(() => ({
      round,
    }));
  },
  messages: [],
  newMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
}));
