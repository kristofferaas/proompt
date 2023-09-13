"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { gameStateSchema } from "@/lib/game/state";

export const CreateGame: React.FC = () => {
  const router = useRouter();
  const { mutate, error } = useMutation({
    mutationFn: create,
    onSuccess: (data) => {
      router.push(`/g/${data.id}`);
    },
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const playerName = formData.get("playerName")?.toString();
    if (!playerName) return;
    mutate({ playerName });
  };

  return (
    <div className="my-auto w-60 rounded-lg border flex flex-col p-4 space-y-4">
      <h1 className="text-center text-2xl font-bold">Create game</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleCreate}>
        <Input name="playerName" type="text" placeholder="playerName" />
        <Button type="submit">Create</Button>
        {!!error && (
          <p className="text-center text-red-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </form>
    </div>
  );
};

const create = async (data: { playerName: string }) => {
  const res = await fetch("/api/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const { id, state } = await res.json();
  if (typeof id !== "number") {
    throw new Error("TODO: Improve this method");
  }
  return { id, state: gameStateSchema.parse(state) };
};
