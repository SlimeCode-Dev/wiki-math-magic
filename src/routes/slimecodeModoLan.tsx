import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/slimecodeModoLan")({
  head: () => ({
    meta: [
      { title: "slimecodeModoLan" },
      { name: "description", content: "" },
      { property: "og:title", content: "slimecodeModoLan" },
      { property: "og:description", content: "" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SlimecodeModoLan,
});

function SlimecodeModoLan() {
  return (
    <div className="min-h-screen" />
  );
}
