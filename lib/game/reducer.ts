import { Action } from "./action";
import { GameState } from "./state";

const SECRET_WORDS = ["apple", "banana", "orange", "pear", "grape"];

export const reducer = (state: GameState, action: Action) => {
  switch (action?.type) {
    case "guess": {
      state.guesses.push({
        createdAt: new Date().toISOString(),
        playerName: action.payload.player,
        guess: action.payload.guess,
      });
      return state;
    }
    case "join": {
      state.players.push({
        playerName: action.payload.playerName,
        score: 0,
        role: "guesser",
      });
      return state;
    }
    case "image-generated": {
      state.image = action.payload.image;
      return state;
    }
    default: {
      return state;
    }
  }
};
