import { CreateGame } from "@/components/create-game";
import { roomStateSchema } from "../api/state/route";
export default async function CreateGamePage() {
  return (
    <main className="w-screen h-screen flex justify-center">
      <CreateGame />
    </main>
  );
}
