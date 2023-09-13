"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";

export function OngoingGame({ roomCode }: { roomCode: number }) {
  return (
    <Button variant="secondary" asChild>
      <Link href={`/g/${roomCode}`}>
        Join ongoing game
        <ArrowRightIcon className="w-4 h-4 ml-2" />
      </Link>
    </Button>
  );
}
