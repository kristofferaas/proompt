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
    const name = formData.get("name");
    const roomCode = formData.get("roomCode");
    if (!name || !roomCode) return;
    mutate({ name: name.toString(), roomCode: roomCode.toString() });
  };

  return (
    <div className="w-60 rounded-lg border flex flex-col p-4 space-y-4">
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
        className="text-sm text-muted-foreground text-center"
      >
        Create a new game
      </Link>
    </div>
  );
};

const join = async (data: { name: string; roomCode: string }) => {
  const res = await fetch("/api/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  const roomId = body.room.id;
  if (typeof roomId === "number") {
    return roomId;
  }
  throw new Error("TODO: Improve this method");
};
