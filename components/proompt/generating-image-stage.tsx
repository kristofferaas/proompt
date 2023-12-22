"use client";

import { useProompt } from "./useProompt";

export function GeneratingImageStage() {
  const status = useProompt((state) => state.round?.status);

  if (status !== "generating") return null;

  return (
    <div className="container bg-background text-foreground fixed w-full h-full z-50">
      <div className="h-full max-w-[320px] flex flex-col justify-center mx-auto gap-5">
        <h1 className="text-4xl text-center">Generating image...</h1>
      </div>
    </div>
  );
}
