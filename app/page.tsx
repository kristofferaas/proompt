import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { rooms } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const searchParamsSchema = z.object({
  error: z.string().optional(),
});

export default function Home({ searchParams }: { searchParams: unknown }) {
  const { error } = searchParamsSchema.parse(searchParams);

  return (
    <main className="w-screen h-screen flex justify-center">
      <form className=" my-auto rounded-lg border" action={joinRoom}>
        <div className="flex flex-col p-4 space-y-4">
          <h1 className="text-center text-lg font-bold">Prompt Game</h1>
          <Input name="name" type="text" placeholder="Name" />
          <Input name="id" type="text" placeholder="ID" />
          <Button type="submit">Join game</Button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </form>
    </main>
  );
}

const joinRoom = async (data: FormData) => {
  "use server";
  const name = data.get("name");
  const id = data.get("id");

  if (!name || !id) {
    redirect(`/?error=Missing name or id`);
  }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, Number(id)),
  });

  if (!room) {
    return redirect("/?error=Room not found");
  }

  redirect(`/g/${id}?name=${name}`);
};
