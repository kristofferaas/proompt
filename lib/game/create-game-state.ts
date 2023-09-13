import { reducer } from "./reducer";
import { GameState } from "./state";

const INITIAL_GAME_STATE = {
  players: [],
  guesses: [],
} satisfies GameState;

export const createGameState = () => {
  const state = reducer(INITIAL_GAME_STATE, {
    type: "create-game",
    payload: {
      // TODO: Add game options here
    },
  });

  return state;
};
