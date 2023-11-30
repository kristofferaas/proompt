import { CurrentImage } from "@/components/game/current-image";
import { Guesses } from "@/components/game/guesses";
import { Players } from "@/components/game/players";
import { PromptStage } from "@/components/game/prompt-stage";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const gameRoomParamsSchema = z.object({
  gameId: z.string(),
});

export default async function GameRoom({ params }: { params: unknown }) {
  const { gameId } = gameRoomParamsSchema.parse(params);
  const claims = await getOnGoingGame();

  const isSpectator = claims?.gameId !== Number(gameId);

  return (
    <main className="container max-w-4xl flex flex-col gap-4">
      <h1 className="text-2xl mt-4 font-bold text-center">Proompt</h1>
      {isSpectator && (
        <p className="text-center">
          {"You are a spectator. You can't submit guesses."}
        </p>
      )}
      <div className="flex gap-4">
        <CurrentImage gameId={gameId} />
        {claims && <PromptStage claims={claims} />}
        <div className="flex flex-col gap-4">
          <Players roomId={gameId} />
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
