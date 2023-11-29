import { CurrentImage } from "@/components/game/current-image";
import { Guesses } from "@/components/game/guesses";
import { Players } from "@/components/game/players";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const gameRoomParamsSchema = z.object({
  gameId: z.string(),
});

export default async function GameRoom({ params }: { params: unknown }) {
  const { gameId } = gameRoomParamsSchema.parse(params);
  const claims = await getOnGoingGame();

  return (
    <main className="container h-screen flex flex-col">
      <div className="flex justify-center">
        <h1 className="font-bold text-2xl py-2">Proompt</h1>
      </div>
      <div className="flex flex-auto justify-between gap-4 py-4">
        <div className="w-80 flex">
          <Players roomId={gameId} />
        </div>
        <div className="grow shrink-0">
          <CurrentImage gameId={gameId} />
        </div>
        <div className="w-80 flex">
          <Guesses roomId={gameId} player={claims?.name} />
        </div>
      </div>
    </main>
  );
}

const getOnGoingGame = async () => {
  try {
    const token = cookies().get("token");
    if (!token) return null;
    return await verifyToken(token.value);
  } catch {
    return null;
  }
};
