import { Message } from "@/lib/schema/message-schema";
import { Player } from "@/lib/schema/player-schema";
import { Round } from "@/lib/schema/round-schema";
import { create } from "zustand";

type ProomptState = {
  round: Round | null;
  setRound: (round: Round) => void;
  messages: Message[];
  newMessage: (message: Message) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
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
  players: [],
  setPlayers: (players) => {
    set((state) => ({
      players,
    }));
  },
}));
