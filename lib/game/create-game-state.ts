import { reducer } from "./reducer";
import { GameState } from "./state";

const INITIAL_GAME_STATE = {
  players: [],
  guesses: [],
  prompter: null,
  secretWord: null,
  availableWords: [],
  image: null,
  roundExpiresAt: null,
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
