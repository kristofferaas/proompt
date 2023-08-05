import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import error from "next/error";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { shuffle, draw, series } from "radash";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = idSchema.parse(searchParams.get("id"));
  if (id == null) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
  });
  if (room == null) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room.state);
}

type PlayerState = {
  name: string;
  score: number;
};

export const playerStateSchema = z.object({
  name: z.string(),
  score: z.number(),
});

export const gameStateSchema = z.object({
  availableSecretWords: z.array(z.string()),
  secretWord: z.string().nullable(),
  currentPrompterPlayer: z.string(),
  prompterPlayerQueue: z.array(z.string()),
  generatedImageUrl: z.string().nullable(),
  guesses: z.array(
    z.object({
      createdAt: z.coerce.date(),
      playerName: z.string(),
      guess: z.string(),
    })
  ),
});

// type GameState = {
//   availableSecretWords: string[];
//   secretWord: string | null;
//   currentPrompterPlayer: string;
//   prompterPlayerQueue: string[];
//   generatedImageUrl: string | null;
//   guesses: { createdAt: Date; playerName: string; guess: string }[];
// };
export type GameState = z.infer<typeof gameStateSchema>;

export const roomStateSchema = z.object({
  players: z.array(playerStateSchema),
  currentGame: gameStateSchema.nullable(),
});

export type RoomState = z.infer<typeof roomStateSchema>;

const secretWordList = [
  "hamburger",
  "pizza",
  "baguette",
  "steak",
  "lasagna",
  "spaghetti",
];

/*
[
  {
    "createdAt": "2022-01-01T00:00:00.000Z",
    "playerName": "Alice",
    "guess": "hamburger"
  },
  {
    "createdAt": "2022-01-01T00:01:00.000Z",
    "playerName": "Bob",
    "guess": "pizza"
  },
  {
    "createdAt": "2022-01-01T00:02:00.000Z",
    "playerName": "Charlie",
    "guess": "baguette"
  },
  {
    "createdAt": "2022-01-01T00:03:00.000Z",
    "playerName": "Dave",
    "guess": "steak"
  },
  {
    "createdAt": "2022-01-01T00:04:00.000Z",
    "playerName": "Eve",
    "guess": "lasagna"
  },
  {
    "createdAt": "2022-01-01T00:05:00.000Z",
    "playerName": "Frank",
    "guess": "spaghetti"
  }
]
*/


function generateSecretWords() {
  return shuffle(secretWordList).splice(0, 3);
}

function createNewGameState(room: RoomState): GameState {
  const availableSecretWords = generateSecretWords();
  const prompterPlayerQueue = shuffle(
    room.players.map((player) => player.name)
  );
  const firstPrompter = prompterPlayerQueue.splice(0)[0];
  if(firstPrompter == null) throw new Error("No players in room");
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
  if(nextPrompter == null) throw new Error("No players in room");

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
