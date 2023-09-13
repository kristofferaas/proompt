import { JoinGame } from "@/components/join-game";
import { OngoingGame } from "@/components/ongoing-game";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function Home() {
  const claim = await getOnGoingGame();

  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center align-middle gap-4">
      {claim && <OngoingGame gameId={claim.gameId} />}
      <JoinGame />
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
