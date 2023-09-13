import { reducer } from "@/lib/game/reducer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGameState } from "./use-game-state";
import { Action } from "@/lib/game/action";

export const useSendAction = (roomId: string) => {
  const [state] = useGameState(roomId);
  const queryClient = useQueryClient();

  return useMutation(
    (action: Action) =>
      fetch(`http://localhost:3000/api/games/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action),
      }),
    {
      onMutate: async (action) => {
        const optimisticState = reducer(state, action);
        queryClient.setQueryData(["room", roomId], optimisticState);
      },
    }
  );
};
