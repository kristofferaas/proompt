import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { RoomCode, RoomState } from "@/app/api/state/route";
import { z } from "zod";

const claimsSchema = z.object({
  name: z.string(),
  roomCode: z.number(),
});

export type Claims = z.infer<typeof claimsSchema>;

export const claimName = async (
  name: string,
  roomCode: RoomCode,
  state: RoomState
) => {
  const nameTaken = state.players.some((player) => player.name === name);

  if (nameTaken) {
    return null;
  }

  const claims = claimsSchema.parse({ name, roomCode });

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(env.SECRET));
};

export const verifyToken = async (token: string) => {
  const secret = new TextEncoder().encode(env.SECRET);
  const jwt = await jwtVerify(token, secret);
  return claimsSchema.parse(jwt.payload);
};
