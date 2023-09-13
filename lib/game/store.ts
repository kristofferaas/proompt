import { Action } from "./action";
import { db } from "../db";
import { games } from "../db/schema";
import { eq } from "drizzle-orm";
import { gameStateSchema } from "./state";
import { reducer } from "./reducer";

export interface Store {
  dispatch: (action: Action) => void;
}

export const getGameStore = (gameId: number) => {
  const gameStore: Store = {
    dispatch: (action: Action) => {
      db.transaction(async (tx) => {
        // Game current game state from db
        const [game] = await tx
          .select({
            state: games.state,
          })
          .from(games)
          .where(eq(games.id, gameId));

        // Validate current game state and player action
        const currentGameState = gameStateSchema.parse(game?.state);
        
        // Apply action to get next game state
        const nextGameState = reducer(currentGameState, action);
        
        // Save next game state to db
        await tx
          .update(games)
          .set({ state: nextGameState })
          .where(eq(games.id, gameId));
      });
    },
  };

  return gameStore;
};
