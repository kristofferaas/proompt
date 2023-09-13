import { roomStateSchema } from "@/app/api/state/_schema";
import { useQuery } from "@tanstack/react-query";

export function useRoomState(roomId: string) {
  const { data, ...query } = useQuery(
    ["room-state", roomId],
    () => getRoomState(roomId),
    {
      retry: false,
      refetchInterval: 1000,
      suspense: true,
    }
  );
  return [data!, query] as const;
}

const getRoomState = async (gameId: string) => {
  const res = await fetch(`/api/state?id=${gameId}`);
  const data = await res.json();
  return roomStateSchema.parse(data);
};
