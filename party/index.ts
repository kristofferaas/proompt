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

const envSchema = z.object({
  REPLICATE_API_TOKEN: z.string(),
  CLERK_ENDPOINT: z.string(),
});

export default class Server implements Party.Server {
  private party: Party.Party;
  private env: ReturnType<typeof envSchema.parse>;
  private currentRound: Round;
  private guessingStarted: number;
  private ai: AI;

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
    });
    this.updatePlayers();
  }

  onClose(conn: Party.Connection) {
    updateConnectionState(conn, null);
    this.updatePlayers();
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log(`Received message from ${sender.id}: ${message}`);
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
        this.playerGuessed(player, clientMessage);
        break;
      }
      case "pick-word": {
        this.playerPickedWord(player, clientMessage);
        break;
      }
      case "prompt-word": {
        this.playerPromptedWord(player, clientMessage);
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
    this.updatePlayers();

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
  playerGuessed(player: Player, message: Guess) {
    const round = this.currentRound;
    // Can't guess if we're not guessing
    if (round.status !== "guessing") {
      return;
    }
    // Prompter can't guess
    const isPrompter = player.id === round.prompter;
    if (isPrompter) {
      return;
    }
    // Check if the player guessed the correct word
    if (message.guess === round.word) {
      // The player guessed the word
      const score = this.calculateScore();
      const scores = round.scores ?? {};
      scores[player.id] = score;
      this.updateRound({
        ...round,
        scores,
      });

      // End the round if everyone has guessed, except the prompter
      const players = this.getPlayers();
      const playersWithoutPrompter = players.filter(
        (player) => player.id !== round.prompter
      );
      const everyoneGuessed = playersWithoutPrompter.every((player) => {
        return player.id === round.prompter || scores[player.id] !== undefined;
      });

      if (everyoneGuessed) {
        // Round is finished
        this.roundFinished();
      }
    } else {
      // The player didn't guess the word
      // TODO: Check if the guess was close
    }
    this.addGuess(message.guess, player);
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
      console.log("is not prompter");
      return;
    }
    this.updateRound({
      ...round,
      word: message.word,
      status: "prompting",
    });
  }

  playerPromptedWord(player: Player, message: PromptWord) {
    const round = this.currentRound;
    // Wait for prompter to prompt
    const isPrompter = player.id === round.prompter;
    if (!isPrompter) {
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
      this.updateRound({
        ...round,
        imageUrl,
        status: "guessing",
      });
    } catch (e) {
      console.error(e);
    }
  }

  playerReady(player: Player, sender: Party.Connection) {
    const round = this.currentRound;
    console.log("Player ready", round.status);
    // Can't ready if we're not waiting or finished
    if (round.status !== "waiting" && round.status !== "finished") {
      return;
    }

    // Update player to be ready
    updateConnectionState(sender, { ...player, ready: true });

    // When everyone is ready pick a prompter and start a new round
    const players = this.getPlayers();
    const everyoneReady = players.every((player) => player.ready);
    if (everyoneReady) {
      // Round is starting
      this.roundStarted();
    } else {
      // Update players
      this.updatePlayers();
    }
  }

  unreadyPlayers() {
    const connections = this.party.getConnections();
    for (const connection of connections) {
      const player = getConnectionState(connection);
      if (player) {
        updateConnectionState(connection, { ...player, ready: false });
      }
    }
    this.updatePlayers();
  }

  updatePlayers() {
    const players = this.getPlayers();
    const playersMessage: ServerSentMessage = {
      type: "player-update",
      players,
    };
    this.party.broadcast(JSON.stringify(playersMessage));
  }

  async addGuess(guess: string, player: Player) {
    // Create message object
    const message: Message = {
      player: player.name,
      text: guess,
      ts: Date.now(),
    };

    const messageReceivedMessage: ServerSentMessage = {
      type: "message-received",
      message,
    };

    // Broadcast new message to all connections
    this.party.broadcast(JSON.stringify(messageReceivedMessage));
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
    const roundFinishedMessage: ServerSentMessage = {
      type: "round-update",
      round: {
        ...round,
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
        prompt: null,
        word: null,
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

  calculateScore() {
    // Calculate score, lower delta is better
    // clamp score from 0 to 100
    const deltaMs = Date.now() - this.guessingStarted;
    const delta = Math.min(deltaMs / 1000, 100);

    // Calculate score
    const score = Math.round(100 - delta);
    return score;
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
