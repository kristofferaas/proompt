import { Message } from "@/lib/schema/message-schema";
import { Round } from "@/lib/schema/round-schema";
import {
  ClientSentMessage,
  ServerSentMessage,
  clientSentMessagesSchema,
} from "@/lib/schema/websocket-schema";
import { connect } from "http2";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  private currentRound: Round;
  private presentPlayers: Set<string> = new Set();

  constructor(readonly party: Party.Party) {
    this.currentRound = this.newRound();
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    // Send current round to new connection
    const roundStartedMessage: ServerSentMessage = {
      type: "round-started",
      round: this.currentRound,
    };
    conn.send(JSON.stringify(roundStartedMessage));

    // Add player from connection to the game
    this.addPlayer(conn);
    this.updatePlayers();
  }

  onClose(conn: Party.Connection) {
    // A websocket just disconnected!
    console.log(`Disconnected:
  id: ${conn.id}
  room: ${this.party.id}`);
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);

    const data = clientSentMessagesSchema.parse(JSON.parse(message));
    switch (data.type) {
      case "ready": {
        this.step(data, sender);
      }
      case "message-send": {
        this.step(data, sender);
        break;
      }
      case "pick-word": {
        this.step(data, sender);
        break;
      }
      case "prompt-word": {
        // Update the current round
        this.step(data, sender);
        break;
      }
      default: {
        console.error(`Unhandled type: ${data}`);
        throw new Error(`Unhandled type`);
      }
    }
  }

  step(data: ClientSentMessage, sender: Party.Connection) {
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
        const players = Array.from(this.presentPlayers);
        const prompter = players[Math.floor(Math.random() * players.length)];
        if (!prompter) {
          console.error("No prompter found");
          return;
        }
        this.updateRound({
          ...round,
          prompter,
          status: "picking-word",
        });
        break;
      }
      case "picking-word": {
        // Wait for prompter to pick a word
        const isPrompter = sender.id === round.prompter;
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
        const isPrompter = sender.id === round.prompter;
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
          this.step(mock, sender);
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
        if (data.type !== "message-send") {
          return;
        }
        // Prompter can't guess
        if (sender.id === round.prompter) {
          return;
        }
        // Check if the player guessed the correct word
        if (data.message.text === round.word) {
          // The player guess the word
          console.log(sender.id, "guessed the word", round.word);
          this.updateRound({
            ...round,
            status: "finished",
          });
          // TODO
        } else {
          // The player didn't guess the word
          // TODO: Check if the guess was close
        }
        this.addMessage(data.message, sender);
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
    // Update present players
    const presentPlayers = new Set<string>();
    const connections = this.party.getConnections();
    for (const conn of connections) {
      presentPlayers.add(conn.id);
    }
    this.presentPlayers = presentPlayers;
  }

  async addPlayer(conn: Party.Connection) {
    // Create player object
    const player = {
      id: conn.id,
      name: "Player " + conn.id.slice(0, 4),
      score: 0,
    };

    // Add player to the players shard
    await this.party.storage.put(`player:${player.id}`, player);

    const playerConnectedMessage: ServerSentMessage = {
      type: "player-connected",
      player,
    };

    // Broadcast new player to all connections
    this.party.broadcast(JSON.stringify(playerConnectedMessage));
  }

  async addMessage(message: Message, sender: Party.Connection) {
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
}

Server satisfies Party.Worker;
