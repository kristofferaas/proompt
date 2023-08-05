import { Action } from "@/lib/reducer";
import { useMutation } from "@tanstack/react-query";

export const useSendAction = (roomId: string) => {
  return useMutation((action: Action) =>
    fetch(`/api/action?id=${roomId}`, {
      method: "POST",
      body: JSON.stringify(action),
    })
  );
};
