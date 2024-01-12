import {
  Guess,
  Join,
  PickWord,
  PromptWord,
  clientSentMessagesSchema,
} from "@/lib/schema/client-sent-message-schema";
import { Message } from "@/lib/schema/message-schema";
import { Player, playerSchema } from "@/lib/schema/player-schema";
import { Round } from "@/lib/schema/round-schema";
import { ServerSentMessage } from "@/lib/schema/server-sent-message-schema";
import { verifyToken } from "@clerk/nextjs/server";
import type * as Party from "partykit/server";
import { AI, createAI } from "./ai";
import { z } from "zod";
import { distance } from "fastest-levenshtein";

const envSchema = z.object({
  REPLICATE_API_TOKEN: z.string(),
  CLERK_ENDPOINT: z.string(),
});

const MINIMUM_PLAYERS = 1;
const TIME_PER_ROUND = 90;

export default class Server implements Party.Server {
  private party: Party.Party;
  private env: ReturnType<typeof envSchema.parse>;
  private currentRound: Round;
  private guessingStarted: number;
  private ai: AI;
  private roundTimeout: ReturnType<typeof setTimeout> | null = null;
  private hintTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(party: Party.Party) {
    this.party = party;
    this.env = envSchema.parse(party.env);
    this.currentRound = {
      id: Date.now(),
      status: "waiting",
      imageUrl: null,
      prompt: null,
      word: null,
      prompter: null,
      scores: null,
      guessTime: TIME_PER_ROUND,
    };
    this.guessingStarted = 0;
    this.ai = createAI({
      auth: this.env.REPLICATE_API_TOKEN,
    });
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    try {
      const env = envSchema.parse(lobby.env);
      // get authentication server url from environment variables (optional)
      const issuer = env.CLERK_ENDPOINT;
      // get token from request query string
      const token = new URL(request.url).searchParams.get("token") ?? "";
      // verify the JWT (in this case using clerk)
      const session = await verifyToken(token, { issuer });
      // pass any information to the onConnect handler in headers (optional)
      request.headers.set("X-User-ID", session.sub);
      // forward the request onwards on onConnect
      return request;
    } catch (e) {
      // authentication failed!
      // short-circuit the request before it's forwarded to the party
      return new Response("Unauthorized", { status: 401 });
    }
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const userId = ctx.request.headers.get("X-User-ID");

    if (!userId) {
      console.error("No user ID");
      return;
    }

    updateConnectionState(conn, {
      id: userId,
      name: "Anonymous",
      score: 0,
      ready: false,
      guessedAt: null,
    });
    this.notifyPlayers();
  }

  onClose(conn: Party.Connection) {
    updateConnectionState(conn, null);
    this.notifyPlayers();
  }

  onMessage(message: string, sender: Party.Connection) {
    const clientMessage = clientSentMessagesSchema.parse(JSON.parse(message));
    const player = getConnectionState(sender);
    if (!player) {
      console.error("No player found");
      return;
    }
    switch (clientMessage.type) {
      case "join": {
        this.playerJoined(player, clientMessage, sender);
        break;
      }
      case "ready": {
        this.playerReady(player, sender);
        break;
      }
      case "guess": {
        this.playerGuessed(player, clientMessage, sender);
        break;
      }
      case "pick-word": {
        this.playerPickedWord(player, clientMessage);
        break;
      }
      case "prompt-word": {
        this.playerPromptedWord(player, clientMessage, sender);
        break;
      }
      default: {
        console.error(`Unhandled type: ${clientMessage}`);
        throw new Error(`Unhandled type`);
      }
    }
  }

  async playerJoined(player: Player, message: Join, sender: Party.Connection) {
    // Update players
    updateConnectionState(sender, { ...player, name: message.name });
    this.notifyPlayers();

    // Send current round to new connection but remove prompt and word
    const round = this.currentRound;
    const roundStartedMessage: ServerSentMessage = {
      type: "round-update",
      round: {
        ...round,
        prompt: null,
        word: null,
      },
    };
    sender.send(JSON.stringify(roundStartedMessage));
  }

  // Handle a player guessing a word
  playerGuessed(player: Player, { guess }: Guess, sender: Party.Connection) {
    const round = this.currentRound;
    const isPrompter = player.id === round.prompter;
    // Can't guess if we're not guessing or player is prompter
    if (round.status !== "guessing" || isPrompter) {
      return;
    }

    // Create message object
    const message: Message = {
      player: player.name,
      text: guess,
      ts: Date.now(),
    };

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedWord = round.word?.toLowerCase().trim() ?? "";

    // Check if the player guessed the correct word
    if (normalizedGuess === normalizedWord) {
      // The player guessed the word

      // Update player with guessedAt timestamp and notify all players
      updateConnectionState(sender, { ...player, guessedAt: Date.now() });
      this.notifyPlayers();

      // End the round if everyone has guessed, except the prompter
      const players = this.getPlayers();
      const playersWithoutPrompter = players.filter(
        (player) => player.id !== round.prompter
      );
      const everyoneGuessed = playersWithoutPrompter.every((player) => {
        return player.id === round.prompter || player.guessedAt;
      });

      if (everyoneGuessed) {
        // Round is finished
        this.roundFinished();
      } else {
        // Broadcast that the player guessed the word
        const messageReceivedMessage: ServerSentMessage = {
          type: "message-received",
          message: {
            player: "🤖 Proompt",
            text: `${player.name} guessed the word!`,
            ts: Date.now() + 1,
          },
        };
        this.party.broadcast(JSON.stringify(messageReceivedMessage));
      }
    } else {
      // The player didn't guess the word

      // Broadcast the incorrect guess to all connections
      const messageReceivedMessage: ServerSentMessage = {
        type: "message-received",
        message,
      };
      this.party.broadcast(JSON.stringify(messageReceivedMessage));

      // The levenshtein distance between the guess and the word is less than 3
      if (distance(normalizedGuess, normalizedWord) < 3) {
        // Broadcast that the guess was close
        const messageReceivedMessage: ServerSentMessage = {
          type: "message-received",
          message: {
            player: "🤖 Proompt",
            text: `${player.name} was close!`,
            ts: Date.now() + 1,
          },
        };
        this.party.broadcast(JSON.stringify(messageReceivedMessage));
      }
    }
  }

  // Handle a player picking a word
  playerPickedWord(player: Player, message: PickWord) {
    const round = this.currentRound;

    // Can't pick a word if we're not picking a word
    if (round.status !== "picking-word") {
      return;
    }

    // Wait for prompter to pick a word
    const isPrompter = player.id === round.prompter;
    if (!isPrompter) {
      console.error("is not prompter");
      return;
    }
    this.updateRound({
      ...round,
      word: message.word,
      status: "prompting",
    });
  }

  playerPromptedWord(
    player: Player,
    message: PromptWord,
    sender: Party.Connection
  ) {
    const round = this.currentRound;
    // Can't prompt if we're not prompting or player is not prompter
    const isPrompter = player.id === round.prompter;
    if (!isPrompter || round.status !== "prompting") {
      return;
    }

    const word = round.word;
    if (!word) {
      console.error("No word");
      return;
    }

    // Prompt can't contain the word
    const normalizedWord = word.toLowerCase();
    const normalizedPrompt = message.prompt.toLowerCase();
    const promptContainsWord = normalizedPrompt.includes(normalizedWord);

    if (promptContainsWord) {
      const invalidPromptMessage: ServerSentMessage = {
        type: "invalid-prompt",
        message: "Prompt cannot contain the word",
      };
      sender.send(JSON.stringify(invalidPromptMessage));
      return;
    }

    this.updateRound({
      ...round,
      prompt: message.prompt,
      status: "generating",
    });

    this.generateImage();
  }

  async generateImage() {
    const round = this.currentRound;
    const prompt = round.prompt;
    if (!prompt) {
      console.error("No prompt");
      return;
    }
    // Wait for server to generate image
    try {
      const data = await this.ai.generateImage(prompt);
      const imageUrl = data?.[0] || "https://picsum.photos/seed/picsum/512/512";

      this.guessingStarted = Date.now();

      this.updateRound({
        ...round,
        imageUrl,
        status: "guessing",
      });

      const extraTimeInSeconds = 3;
      const guessTimeInMs = (extraTimeInSeconds + round.guessTime) * 1000;
      this.roundTimeout = setTimeout(() => {
        // Round is finished
        this.roundFinished();
      }, guessTimeInMs);

      // When there is 10 seconds left, broadcast the prompt
      const broadcastPromptTimeInMs = (round.guessTime - 30) * 1000;
      this.hintTimeout = setTimeout(() => {
        if (this.currentRound.status !== "guessing") {
          return;
        }
        const prompter = this.getPlayers().find(
          (player) => player.id === round.prompter
        );
        const prePromptMessage: ServerSentMessage = {
          type: "message-received",
          message: {
            player: "🤖 Proompt",
            text: `The prompt ${prompter?.name} wrote was:`,
            ts: Date.now() + 1,
          },
        };
        const promptMessage: ServerSentMessage = {
          type: "message-received",
          message: {
            player: "🤖 Proompt",
            text: `${round.prompt}`,
            ts: Date.now() + 1,
          },
        };
        this.party.broadcast(JSON.stringify(prePromptMessage));
        this.party.broadcast(JSON.stringify(promptMessage));
      }, broadcastPromptTimeInMs);
    } catch (e) {
      console.error(e);
    }
  }

  playerReady(player: Player, sender: Party.Connection) {
    const round = this.currentRound;
    // Can't ready if we're not waiting or finished
    if (round.status !== "waiting" && round.status !== "finished") {
      return;
    }

    // Update player to be ready
    updateConnectionState(sender, { ...player, ready: true });

    const players = this.getPlayers();
    const everyoneReady = players.every((player) => player.ready);
    // Start the round if there are at least 4 players and everyone is ready
    if (everyoneReady && players.length >= MINIMUM_PLAYERS) {
      // Round is starting
      this.roundStarted();
    } else {
      // Update players
      this.notifyPlayers();
    }
  }

  unreadyPlayers() {
    const connections = this.party.getConnections();
    for (const connection of connections) {
      const player = getConnectionState(connection);
      if (player) {
        updateConnectionState(connection, {
          ...player,
          ready: false,
          guessedAt: null,
        });
      }
    }
    this.notifyPlayers();
  }

  notifyPlayers() {
    const players = this.getPlayers();
    const playersMessage: ServerSentMessage = {
      type: "player-update",
      players,
    };
    this.party.broadcast(JSON.stringify(playersMessage));
  }

  roundStarted() {
    const round = this.currentRound;

    // Pick a random player to be prompter
    const players = this.getPlayers();
    const prompter = players[Math.floor(Math.random() * players.length)];
    if (!prompter) {
      console.error("No prompter found");
      return;
    }

    this.updateRound({
      ...round,
      prompter: prompter.id,
      status: "picking-word",
    });
  }

  roundFinished() {
    this.currentRound.status = "finished";
    const round = this.currentRound;

    // Clear timeouts
    if (this.roundTimeout) {
      clearTimeout(this.roundTimeout);
      this.roundTimeout = null;
    }
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }

    // Calculate scores
    const scores = this.calculateScores();

    const roundFinishedMessage: ServerSentMessage = {
      type: "round-update",
      round: {
        ...round,
        scores,
        status: "finished",
      },
    };
    this.unreadyPlayers();
    this.party.broadcast(JSON.stringify(roundFinishedMessage));
  }

  updateRound(round: Round) {
    this.currentRound = round;
    let roundMessage: ServerSentMessage = {
      type: "round-update",
      round: {
        ...round,
        // TODO: Remove prompt and word for non-prompter
        // prompt: null,
        // word: null,
      },
    };
    this.party.broadcast(JSON.stringify(roundMessage));
  }

  getPlayers() {
    const players = new Map<string, Player>();
    const connections = this.party.getConnections();

    for (const connection of connections) {
      const player = getConnectionState(connection);
      if (player) {
        players.set(player.id, player);
      }
    }

    return Array.from(players.values());
  }

  calculateScores() {
    // Calculate scores for this round
    const players = this.getPlayers();
    const scores = new Map<string, number>();

    const prompter = players.find(
      (player) => player.id === this.currentRound.prompter
    );
    const guessers = players.filter(
      (player) => player.id !== this.currentRound.prompter
    );

    // First calculate scores for guessers
    // The faster you guess the more points you get
    for (const guesser of guessers) {
      if (guesser.guessedAt) {
        // The closer to time allowed the more points you get
        // Max score is 1000
        const timeAllowedInSeconds = this.currentRound.guessTime;
        const timeTakenInSeconds =
          (guesser.guessedAt - this.guessingStarted) / 1000;
        const timeLeftInSeconds = timeAllowedInSeconds - timeTakenInSeconds;

        // Clamp time between 0 and time allowed
        // and map it to a score between a integer 0 and 1000

        const score = Math.floor(
          (Math.min(Math.max(timeLeftInSeconds, 0), timeAllowedInSeconds) /
            timeAllowedInSeconds) *
            1000
        );
        // Rounded to nearest integer
        const roundedScore = Math.round(score);

        scores.set(guesser.id, roundedScore);
      } else {
        scores.set(guesser.id, 0);
      }
    }
    // Then calculate scores for prompter
    // The more people guess the more points you get
    if (prompter) {
      const playersThatGuessedCorrectly = guessers.filter(
        (player) => player.guessedAt
      );

      // Prompter gets the average score of all correct guessers
      const score =
        playersThatGuessedCorrectly.reduce((acc, player) => {
          return acc + (scores.get(player.id) || 0);
        }, 0) / playersThatGuessedCorrectly.length;
      // Rounded to nearest integer
      const roundedScore = Math.round(score);

      scores.set(prompter.id, roundedScore);
    }

    const results: Record<string, number> = {};
    for (const [key, value] of scores.entries()) {
      results[key] = value || 0;
    }
    return results;
  }
}

Server satisfies Party.Worker;

function updateConnectionState(
  connection: Party.Connection,
  state: Player | null
) {
  setConnectionState(connection, (prev) => {
    if (state) {
      return { ...prev, ...state };
    } else {
      return state;
    }
  });
}

function setConnectionState(
  connection: Party.Connection,
  state: Player | null | ((prev: Player | null) => Player | null)
) {
  if (typeof state !== "function") {
    return connection.setState(state);
  }
  connection.setState((prev: unknown) => {
    const prevParseResult = playerSchema.safeParse(prev);
    if (prevParseResult.success) {
      return state(prevParseResult.data);
    } else {
      return state(null);
    }
  });
}

function getConnectionState(connection: Party.Connection) {
  const result = playerSchema.safeParse(connection.state);
  if (result.success) {
    return result.data;
  } else {
    setConnectionState(connection, null);
    return null;
  }
}
