import { Guesses } from "@/components/game/guesses";
import { Players } from "@/components/game/players";
import { z } from "zod";

const gameRoomParamsSchema = z.object({
  gameId: z.string(),
});

export default function GameRoom({ params }: { params: unknown }) {
  const { gameId } = gameRoomParamsSchema.parse(params);

  return (
    <main className="container max-w-4xl flex flex-col space-y-4">
      <h1 className="text-2xl mt-4 font-bold text-center">Proompt</h1>
      <Players roomId={gameId} />
      <Guesses roomId={gameId} />
    </main>
  );
}
