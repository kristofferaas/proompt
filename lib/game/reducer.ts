import { Action } from "./action";
import { GameState } from "./state";

const TIME_LIMIT_AFTER_IMAGE_GENERATED = 60_000;
const TIME_LIMIT_AFTER_WORD_SELECTED = 45_000;
const SECRET_WORDS = [
  "apple",
  "banana",
  "orange",
  "pear",
  "grape",
  "bingus",
  "chungus",
];
const chooseRandomWords = (count = 3) =>
  SECRET_WORDS.sort(() => 0.5 - Math.random()).slice(0, count);

const ensureStartedGame = (prevState: Readonly<GameState>): GameState => {
  const state = { ...prevState };
  if (state.prompter === null) {
    state.prompter = state.players[0]?.playerName ?? null;
  }
  if (state.availableWords.length === 0) {
    state.availableWords = chooseRandomWords();
  }
  if (
    state.roundExpiresAt == null ||
    state.roundExpiresAt.valueOf() <= new Date().valueOf()
  ) {
    state.image = null;
    state.secretWord = null;
    state.availableWords = chooseRandomWords();
    state.roundExpiresAt = new Date(Date.now() + 10_000);
    state.prompter = state.players[0]?.playerName ?? null;
  }
  return state;
};

export const reducer = (state: GameState, action: Action): GameState => {
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
      });
      state = ensureStartedGame(state);
      return state;
    }
    case "image-generated": {
      state.image = action.payload.image;
      state.roundExpiresAt = new Date(
        Date.now() + TIME_LIMIT_AFTER_IMAGE_GENERATED
      );
      return state;
    }
    case "select-word": {
      state.secretWord = action.payload.word;
      state.roundExpiresAt = new Date(
        Date.now() + TIME_LIMIT_AFTER_WORD_SELECTED
      );
      return state;
    }
    default: {
      return state;
    }
  }
};
