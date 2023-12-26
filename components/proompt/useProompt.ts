import { Message } from "@/lib/schema/message-schema";
import { Player } from "@/lib/schema/player-schema";
import { Round } from "@/lib/schema/round-schema";
import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
import { create } from "zustand";

type ProomptLog = {
  type: string;
  message: string;
};

type ProomptState = {
  round: Round | null;
  setRound: (round: Round) => void;
  messages: Message[];
  newMessage: (message: Message) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  logs: ProomptLog[];
  addLog: (log: ProomptLog) => void;
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
    set(() => ({
      players,
    }));
  },
  logs: [],
  addLog: (log) => {
    set((state) => ({
      logs: [...state.logs, log],
    }));
  },
}));

export const usePlayers = () => {
  return useProompt((state) => state.players);
};

export const useRound = () => {
  return useProompt((state) => state.round);
};

export const useCurrentPlayer = () => {
  const { user } = useUser();
  const round = useRound();
  const players = usePlayers();

  const player = useMemo(() => {
    const currentPlayer = players.find((player) => player.id === user?.id);
    if (!currentPlayer) return null;

    const isPrompter = round?.prompter === currentPlayer.id;

    return {
      ...currentPlayer,
      isPrompter,
    };
  }, [round, players, user]);

  return player;
};

export const usePrompter = () => {
  const round = useRound();
  const players = usePlayers();

  const prompter = useMemo(() => {
    if (!round) return null;

    const prompter = players.find((player) => player.id === round.prompter);
    if (!prompter) return null;

    return prompter;
  }, [round, players]);

  return prompter;
};
