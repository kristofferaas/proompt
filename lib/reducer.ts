import { GameState, RoomState } from "@/app/api/state/route";
import { z } from "zod";

const joinActionSchema = z.object({
  type: z.literal("join"),
  payload: z.object({
    player: z.string(),
  }),
});

const leaveActionSchema = z.object({
  type: z.literal("leave"),
  payload: z.object({
    player: z.string(),
  }),
});

const guessActionSchema = z.object({
  type: z.literal("guess"),
  payload: z.object({
    player: z.string(),
    guess: z.string(),
  }),
});

export const actionSchema = z.union([
  joinActionSchema,
  leaveActionSchema,
  guessActionSchema,
]);

export type Action = z.infer<typeof actionSchema>;

export const reducer = (state: RoomState, action: Action) => {
  switch (action.type) {
    case "guess": {
      state.currentGame?.guesses.push({
        createdAt: new Date(),
        playerName: action.payload.player,
        guess: action.payload.guess,
      });
    }
    default: {
      return { ...state };
    }
  }
};
