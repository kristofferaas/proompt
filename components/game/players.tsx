"use client";

import { useGameState } from "./use-game-state";

type PlayersProps = {
  roomId: string;
};

export const Players: React.FC<PlayersProps> = ({ roomId }) => {
  const [state] = useGameState(roomId);
  const roundExpiresAt = state.roundExpiresAt ?? new Date();
  const secondsLeft = Math.floor(
    (roundExpiresAt.getTime() - Date.now()) / 1000
  );
  return (
    <div className="bg-red-100 border rounded-lg p-4 space-y-4">
      <h2 className="text-lg">Players</h2>
      <h3>{secondsLeft} seconds left of round</h3>
      <ul>
        {state.players.map((player) => (
          <li key={player.playerName}>
            {player.playerName}: {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
};
