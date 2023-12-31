import { ProomptDevTools } from "@/components/proompt/dev-tools";
import { Party } from "@/components/proompt/party";
import { Stages } from "@/components/proompt/stages";
import { env } from "@/lib/env";

export default function PartyIdPage({
  params,
}: {
  params: { partyId: string };
}) {
  const isDev = env.NODE_ENV === "development";
  return (
    <Party room={params.partyId}>
      {isDev && <ProomptDevTools />}
      <Stages />
    </Party>
  );
}
