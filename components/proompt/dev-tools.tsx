"use client";

import { useState } from "react";
import { useProompt } from "./useProompt";
import { XIcon } from "lucide-react";

export function ProomptDevTools() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        className="fixed bottom-0 left-0 z-[9999] p-2 mx-2 my-1"
        onClick={() => setOpen(true)}
      >
        <span className="text-4xl">🤖</span>
      </button>
    );
  }

  return <DevToolsPanel onClose={() => setOpen(false)} />;
}

function DevToolsPanel({ onClose }: { onClose: () => void }) {
  const state = useProompt();
  return (
    <div className="fixed flex flex-col bottom-0 left-0 w-full h-96 bg-secondary text-secondary-foreground border-t z-[9999]">
      <div className="border-b flex justify-between h-10">
        <h1 className="p-2">Proompt Dev Tools</h1>
        <button className="border-l h-10 w-10" onClick={onClose}>
          <XIcon className="w-4 h-4 mx-auto" />
        </button>
      </div>
      <div className="p-2 flex-1 overflow-auto">
        <code>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </code>
      </div>
    </div>
  );
}
