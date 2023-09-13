import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { z } from "zod";
import { GameState } from "./game/state";

const claimsSchema = z.object({
  name: z.string(),
  gameId: z.number(),
});

export type Claims = z.infer<typeof claimsSchema>;

export const claimName = async (
  name: string,
  gameId: number,
  state: GameState
) => {
  const nameTaken = state.players.some((player) => player.playerName === name);

  if (nameTaken) {
    return null;
  }

  const claims = claimsSchema.parse({ name, gameId });

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(env.SECRET));
};

export const verifyToken = async (token: string) => {
  const secret = new TextEncoder().encode(env.SECRET);
  const jwt = await jwtVerify(token, secret);
  return claimsSchema.parse(jwt.payload);
};
