import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    SECRET: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_PARTYKIT_HOST: z.string(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    SECRET: process.env.SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_PARTYKIT_HOST:
      process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "127.0.0.1:1999",
  },
});
