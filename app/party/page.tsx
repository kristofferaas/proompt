"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";

const searchParamsSchema = z.object({
  error: z.string().optional(),
});

export default function PartyPage({ searchParams }: { searchParams: unknown }) {
  const { error } = searchParamsSchema.parse(searchParams);
  const router = useRouter();
  const { user } = useUser();

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString();
    const code = formData.get("code")?.toString();

    if (!name || !code || !user) {
      router.replace("/party?error=invalid");
      return;
    }
    try {
      await user.update({ username: name });
      router.push(`/party/${code}`);
    } catch (error) {
      try {
        if (error instanceof Error) {
          const message = error.message;
          router.replace(`/party?error=${message}`);
        } else {
          router.replace("/party?error=unknown");
        }
      } catch (error) {
        router.replace("/party?error=unknown");
      }
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col w-[320px] gap-6 h-dvh justify-center"
    >
      <h1 className="self-center text-[40px]">Proompt</h1>
      <Input
        defaultValue={user?.username ?? ""}
        name="name"
        type="text"
        placeholder="Enter your name"
        className="h-12"
        required
      />
      <Input
        name="code"
        type="text"
        placeholder="Enter game code"
        className="h-12"
        required
      />
      <Button type="submit" className="h-12">
        Join game
      </Button>
      {error && <p className="text-red-500">{error}</p>}
      <div className="h-12" />
    </form>
  );
}
