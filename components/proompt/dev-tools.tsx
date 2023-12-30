"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Round } from "@/lib/schema/round-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useProompt } from "./useProompt";

export function ProomptDevTools() {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="text-4xl fixed top-0 right-0 z-[9999] p-2 mx-2 my-1">
          🤖
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Devtools</DialogTitle>
        </DialogHeader>
        <DevToolsPanel />
      </DialogContent>
    </Dialog>
  );
}

function DevToolsPanel() {
  return (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="round">Round</TabsTrigger>
        <TabsTrigger value="raw">Raw</TabsTrigger>
      </TabsList>
      <TabsContent value="round">
        <RoundDevTools />
      </TabsContent>
      <TabsContent value="raw">
        <RawDevTools />
      </TabsContent>
    </Tabs>
  );
}

function RawDevTools() {
  const state = useProompt();
  return (
    <code className="flex overflow-auto h-96 bg-secondary text-secondary-foreground rounded-lg p-4">
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </code>
  );
}

function RoundDevTools() {
  const round = useProompt((state) => state.round);

  const handleChangeStatus = (status: Round["status"]) => {
    if (!round) return;
    if (status === "guessing") {
      useProompt.getState().setRound({
        ...round,
        status,
        imageUrl: "https://picsum.photos/seed/picsum/200/200",
        prompt: "A prompt",
      });
      return;
    }
    useProompt.getState().setRound({
      ...round,
      status,
    });
  };

  if (!round) return null;

  return (
    <>
      <Select value={round?.status} onValueChange={handleChangeStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="waiting">Waiting</SelectItem>
          <SelectItem value="picking-word">Picking Word</SelectItem>
          <SelectItem value="prompting">Prompting</SelectItem>
          <SelectItem value="generating">Generating</SelectItem>
          <SelectItem value="guessing">Guessing</SelectItem>
          <SelectItem value="finished">Finished</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
