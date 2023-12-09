import { env } from "@/lib/env";
import { notFound } from "next/navigation";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (env.NODE_ENV !== "development") {
    return notFound();
  }

  return <div className="container max-w-xl">{children}</div>;
}
