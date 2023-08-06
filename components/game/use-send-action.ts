import { Action, reducer } from "@/lib/reducer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoomState } from "./use-game-state";

export const useSendAction = (roomId: string) => {
  const [state] = useRoomState(roomId);
  const queryClient = useQueryClient();

  return useMutation(
    (action: Action) =>
      fetch(`/api/action?id=${roomId}`, {
        method: "POST",
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
