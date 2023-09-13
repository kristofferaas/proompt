import { gameStateSchema } from "@/lib/game/state";
import { useQuery } from "@tanstack/react-query";

export function useGameState(gameId: string) {
  const { data, ...query } = useQuery(
    ["room-state", gameId],
    () => getGameState(gameId),
    {
      retry: false,
      refetchInterval: 1000,
      suspense: true,
    }
  );
  return [data!, query] as const;
}

const getGameState = async (gameId: string) => {
  const res = await fetch(`http://localhost:3000/api/games/${gameId}`);
  const data = await res.json();
  return gameStateSchema.parse(data);
};
