import { Message } from "@/lib/schema/message-schema";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  private currentRound: Round;

  constructor(readonly party: Party.Party) {
    this.currentRound = {
      id: Date.now(),
      status: "waiting",
      imageUrl: null,
      prompt: null,
      word: null,
    };
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
    const roundStartedMessage: Message = {
      type: "round-started",
      round: this.currentRound,
    };
    conn.send(JSON.stringify(roundStartedMessage));

    // Add player from connection to the game
    this.addPlayer(conn);
  }

  onMessage(message: string, sender: Party.Connection) {
    // let's log the message
    console.log(`connection ${sender.id} sent message: ${message}`);
    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      `${sender.id}: ${message}`,
      // ...except for the connection it came from
      [sender.id]
    );
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

    const playerConnectedMessage: Message = {
      type: "player-connected",
      player,
    };

    // Broadcast new player to all connections
    this.party.broadcast(JSON.stringify(playerConnectedMessage));
  }
}

Server satisfies Party.Worker;

type Round = {
  id: number;
  status: "waiting" | "playing" | "finished";
  imageUrl: string | null;
  prompt: string | null;
  word: string | null;
};
