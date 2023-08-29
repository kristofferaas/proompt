import { GameState, RoomState } from "@/app/api/state/route";
import { shuffle } from "radash";
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

const secretWordList = [
  "hamburger",
  "pizza",
  "baguette",
  "steak",
  "lasagna",
  "spaghetti",
];

const initialState = {
  currentGame: {
    availableSecretWords: secretWordList,
    secretWord: null,
    generatedImageUrl: null,
    currentPrompterPlayer: "",
    guesses: [],
    prompterPlayerQueue: [],
  },
  players: [],
} satisfies RoomState;

export const reducer = (state: RoomState = initialState, action: Action) => {
  switch (action?.type) {
    case "guess": {
      state.currentGame?.guesses.push({
        createdAt: new Date(),
        playerName: action.payload.player,
        guess: action.payload.guess,
      });
      return state;
    }
    case "join": {
      state.players.push({
        name: action.payload.player,
        score: 0,
      });
      return state;
    }
    default: {
      return state;
    }
  }
};

function generateSecretWords() {
  return shuffle(secretWordList).splice(0, 3);
}

function createNewGameState(room: RoomState): GameState {
  const availableSecretWords = generateSecretWords();
  const prompterPlayerQueue = shuffle(
    room.players.map((player) => player.name)
  );
  const firstPrompter = prompterPlayerQueue.splice(0)[0];
  if (firstPrompter == null) throw new Error("No players in room");
  return {
    availableSecretWords,
    secretWord: null,
    generatedImageUrl: null,
    currentPrompterPlayer: firstPrompter,
    guesses: [],
    prompterPlayerQueue,
  };
}

function createNewRound(room: RoomState) {
  if (room.currentGame == null) {
    throw new Error("No current game");
  }
  const newPrompterPlayerQueue = [...room.currentGame.prompterPlayerQueue];
  const nextPrompter = newPrompterPlayerQueue.splice(0)[0];
  if (nextPrompter == null) throw new Error("No players in room");

  const nextAvailableSecretWords = generateSecretWords();
  const newGameState: GameState = {
    availableSecretWords: nextAvailableSecretWords,
    secretWord: null,
    generatedImageUrl: null,
    prompterPlayerQueue: newPrompterPlayerQueue,
    currentPrompterPlayer: nextPrompter,
    guesses: [],
  };
}
