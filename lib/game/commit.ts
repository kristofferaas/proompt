import { db } from "@/lib/db";
import { reducer } from "@/lib/game/reducer";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Action } from "./action";
import { gameStateSchema } from "./state";

export const commit = async (id: number, action: Action) => {
  await db.transaction(async (tx) => {
    // Get current game state
    const [room] = await tx
      .select({ state: rooms.state })
      .from(rooms)
      .where(eq(rooms.id, id))
      .for("update")
      .limit(1);

    // Validate current game state
    const currentGameState = gameStateSchema.parse(room?.state);

    // Apply action to get next game state
    const nextGameState = reducer(currentGameState, action);

    // Save next game state to db
    await tx
      .update(rooms)
      .set({ state: nextGameState })
      .where(eq(rooms.id, id));
  });
};
