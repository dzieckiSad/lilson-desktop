import { describe, expect, it } from "vitest";
import { ALL, defaultAgents, pickResponders } from "@/lib/swarm";

describe("pickResponders", () => {
  it("only the chosen agent answers when one agent is selected", () => {
    expect(pickResponders(defaultAgents, "gemini").map((a) => a.id)).toEqual(["gemini"]);
  });
  it("All Agents gets replies from several online agents", () => {
    expect(pickResponders(defaultAgents, ALL).length).toBe(3);
  });
  it("offline agents never answer", () => {
    const agents = defaultAgents.map((a) => (a.id === "gemini" ? { ...a, online: false } : a));
    expect(pickResponders(agents, "gemini")).toEqual([]);
  });
});
