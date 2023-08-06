"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useMutation } from "@tanstack/react-query";

export const JoinGame: React.FC = () => {
  const { mutate, error } = useMutation({
    mutationFn: join,
    onSuccess: () => {
      console.log("Success");
    },
  });

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const roomCode = formData.get("roomCode");
    if (!name || !roomCode) return;
    mutate({ name: name.toString(), roomCode: roomCode.toString() });
  };

  return (
    <div className="my-auto w-60 rounded-lg border flex flex-col p-4 space-y-4">
      <h1 className="text-center text-2xl font-bold">Proompt</h1>
      <form className="flex flex-col space-y-4" onSubmit={handleJoin}>
        <Input name="name" type="text" placeholder="Name" />
        <Input name="roomCode" type="text" placeholder="Room code" />
        <Button type="submit">Join game</Button>
        {!!error && (
          <p className="text-center text-red-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </form>
      <Link
        href="/create-game"
        className="text-sm text-muted-foreground text-center hover:underline"
      >
        Create a new game
      </Link>
    </div>
  );
};

const join = async (data: { name: string; roomCode: string }) => {
  const res = await fetch("/api/join-game", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
