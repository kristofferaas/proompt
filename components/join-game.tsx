"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const JoinGame: React.FC = () => {
  const router = useRouter();
  const { mutate, error } = useMutation({
    mutationFn: join,
    onSuccess: (roomId) => {
      router.push(`/g/${roomId}`);
    },
  });

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const playerName = formData.get("playerName");
    const gameId = formData.get("gameId");
    if (!playerName || !gameId) return;
    mutate({ playerName: playerName.toString(), gameId: gameId.toString() });
  };

  return (
    <div className="w-60 rounded-lg border flex flex-col p-4 space-y-4">
      <h1 className="text-center text-2xl font-bold">Proompt</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleJoin}>
        <Input name="playerName" type="text" placeholder="Player Name" />
        <Input name="gameId" type="text" placeholder="Game id" />
        <Button type="submit">Join game</Button>
        {!!error && (
          <p className="text-center text-red-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </form>
      <Link
        href="/create-game"
        className="text-sm text-muted-foreground text-center"
      >
        Create a new game
      </Link>
    </div>
  );
};

const join = async (data: { playerName: string; gameId: string }) => {
  const res = await fetch(`/api/games/${data.gameId}/join`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Game not found");
  }
  return data.gameId;
};
