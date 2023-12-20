import {
  ClientSentMessage,
  clientSentMessagesSchema,
} from "@/lib/schema/client-sent-message-schema";
import { Message } from "@/lib/schema/message-schema";
import { Player, playerSchema } from "@/lib/schema/player-schema";
import { Round } from "@/lib/schema/round-schema";
import { ServerSentMessage } from "@/lib/schema/server-sent-message-schema";
import { verifyToken } from "@clerk/nextjs/server";
import type * as Party from "partykit/server";

const DEFAULT_CLERK_ENDPOINT = "https://united-escargot-54.clerk.accounts.dev";

export default class Server implements Party.Server {
  private currentRound: Round;

  constructor(readonly party: Party.Party) {
    this.currentRound = this.newRound();
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    try {
      // get authentication server url from environment variables (optional)
      const issuer = DEFAULT_CLERK_ENDPOINT;
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

    // Send current round to new connection
    const roundStartedMessage: ServerSentMessage = {
      type: "round-started",
      round: this.currentRound,
    };
    conn.send(JSON.stringify(roundStartedMessage));

    updateConnectionState(conn, {
      id: userId,
      name: "Anonymous",
      score: 0,
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
        // Update players
        updateConnectionState(sender, { ...player, name: clientMessage.name });
        this.updatePlayers();
        break;
      }
      case "ready": {
        this.step(clientMessage, player);
      }
      case "guess": {
        this.step(clientMessage, player);
        break;
      }
      case "pick-word": {
        this.step(clientMessage, player);
        break;
      }
      case "prompt-word": {
        // Update the current round
        this.step(clientMessage, player);
        break;
      }
      default: {
        console.error(`Unhandled type: ${clientMessage}`);
        throw new Error(`Unhandled type`);
      }
    }
  }

  step(data: ClientSentMessage, player: Player) {
    const round = this.currentRound;

    switch (round.status) {
      case "waiting": {
        if (data.type !== "ready") {
          return null;
        }

        // When everyone is ready pick a prompter and start a new round
        // TODO: actually check
        // const isEveryoneReady = true;

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
        break;
      }
      case "picking-word": {
        // Wait for prompter to pick a word
        const isPrompter = player.id === round.prompter;
        if (!isPrompter) {
          console.log("is not prompter");
          return;
        }
        if (data.type !== "pick-word") {
          console.log("is not pick word message");
          return;
        }
        this.updateRound({
          ...round,
          word: data.word,
          status: "prompting",
        });
        break;
      }
      case "prompting": {
        // Wait for prompter to prompt
        const isPrompter = player.id === round.prompter;
        if (!isPrompter) {
          return;
        }
        if (data.type !== "prompt-word") {
          return;
        }
        this.updateRound({
          ...round,
          prompt: data.prompt,
          status: "generating",
        });

        // Mock
        setTimeout(() => {
          const mock = {} as ClientSentMessage;
          this.step(mock, player);
        }, 5000);
        break;
      }
      case "generating": {
        // Wait for server to generate image
        // TODO
        this.updateRound({
          ...round,
          status: "guessing",
          imageUrl: "https://picsum.photos/seed/picsum/512/512",
        });
        break;
      }
      case "guessing": {
        // Wait for players to guess the word
        if (data.type !== "guess") {
          return;
        }
        // Prompter can't guess
        const isPrompter = player.id === round.prompter;
        if (isPrompter) {
          return;
        }
        // Check if the player guessed the correct word
        if (data.guess === round.word) {
          // The player guess the word
          this.updateRound({
            ...round,
            status: "finished",
          });
          // TODO
        } else {
          // The player didn't guess the word
          // TODO: Check if the guess was close
        }
        this.addGuess(data.guess, player);
        break;
      }
      case "finished": {
        if (data.type !== "ready") {
          return;
        }

        // When everyone is ready start a new round
        // TODO: actually check
        const isEveryoneReady = true;

        if (isEveryoneReady) {
          this.newRound();
        }

        break;
      }
    }
  }

  updateRound(round: Round) {
    this.currentRound = round;
    const prompter = round.prompter;
    let roundMessage: ServerSentMessage = {
      type: "round-started",
      round,
    };

    // Send entire round to prompter
    const prompterConnection = this.party.getConnection(prompter ?? "");
    prompterConnection?.send(JSON.stringify(roundMessage));

    // Remove prompt and word for guessers
    roundMessage = {
      type: "round-started",
      round: {
        ...round,
        prompt: null,
        word: null,
      },
    };

    // Send round to guessers
    this.party.broadcast(JSON.stringify(roundMessage), [prompter ?? ""]);
  }

  updatePlayers() {
    const players = this.getPlayers();
    const playersMessage: ServerSentMessage = {
      type: "presence",
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

    // Add message to the messages shard
    await this.party.storage.put(`message:${message.ts}`, message);

    const messageReceivedMessage: ServerSentMessage = {
      type: "message-received",
      message,
    };

    // Broadcast new message to all connections
    this.party.broadcast(JSON.stringify(messageReceivedMessage));
  }

  newRound() {
    const round: Round = {
      id: Date.now(),
      status: "waiting",
      imageUrl: null,
      prompt: null,
      word: null,
      prompter: null,
    };
    this.currentRound = round;

    const message: ServerSentMessage = {
      type: "round-started",
      round,
    };
    this.party.broadcast(JSON.stringify(message));

    return round;
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
