import { Action } from "./action";
import { GameState } from "./state";

export const reducer = (state: GameState, action: Action) => {
  switch (action?.type) {
    case "guess": {
      state.guesses.push({
        createdAt: new Date(),
        playerName: action.payload.player,
        guess: action.payload.guess,
      });
      return state;
    }
    case "join": {
      state.players.push({
        playerName: action.payload.playerName,
        score: 0,
      });
      return state;
    }
    default: {
      return state;
    }
  }
};
