import { roomStateSchema } from "@/app/api/state/_schema";
import { db } from "@/lib/db";
import { Action, reducer } from "@/lib/game/reducer";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const commit = async (id: number, action: Action) => {
  await db.transaction(async (tx) => {
    // Get current game state
    const [room] = await tx
      .select({ state: rooms.state })
      .from(rooms)
      .where(eq(rooms.id, id))
      .for("update")
      .limit(1);

    const prevState = roomStateSchema.parse(room?.state);

    // Apply action to game state
    const nextState = reducer(prevState, action);

    // Save game state
    await tx.update(rooms).set({ state: nextState }).where(eq(rooms.id, id));
  });
};
