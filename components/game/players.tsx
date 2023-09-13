"use client";

import { useRoomState } from "./use-game-state";

type PlayersProps = {
  roomId: string;
};

export const Players: React.FC<PlayersProps> = ({ roomId }) => {
  const [state] = useRoomState(roomId);

  return (
    <div className="bg-red-100 border rounded-lg p-4 space-y-4">
      <h2 className="text-lg">Players</h2>
      <ul>
        {state.players.map((player) => (
          <li key={player.name}>
            {player.name}: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
};
