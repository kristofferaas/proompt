"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";

export function OngoingGame({ gameId }: { gameId: number }) {
  return (
    <Button variant="secondary" asChild>
      <Link href={`/g/${gameId}`}>
        Join ongoing game
        <ArrowRightIcon className="w-4 h-4 ml-2" />
      </Link>
    </Button>
  );
}
