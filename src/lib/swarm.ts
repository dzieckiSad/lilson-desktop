export type AgentId = string;

export type AgentInfo = {
  id: AgentId;
  name: string;
  model: string;
  online: boolean;
  temperature?: number;
  maxTokens?: number;
  instructions?: string;
};

export type ChatMessage = {
  id: string;
  author: AgentId | "you";
  text: string;
  time: string;
  lead?: boolean;
  attachment?: { name: string; size: string };
  progress?: number;
};

export const ALL = "all";

export const defaultAgents: AgentInfo[] = [
  { id: "claude", name: "Claude", model: "Anthropic Claude 3.5 Sonnet", online: true },
  { id: "codex", name: "Codex", model: "OpenAI Codex", online: true },
  { id: "gemini", name: "Gemini", model: "Google Gemini 1.5 Pro", online: true },
  { id: "llama", name: "Llama", model: "Meta Llama 3.1 70B", online: true },
  { id: "mistral", name: "Mistral", model: "Mistral Large 2", online: true },
  { id: "voyager", name: "Voyager", model: "Custom Research Agent", online: true },
];

const replies: Record<string, string[]> = {
  claude: [
    "Good point. I'll fold that into the architecture and flag any trade-offs for review.",
    "Coordinating the swarm now — I've split this into three subtasks and assigned owners.",
  ],
  codex: [
    "On it. I'll draft the implementation and run the test suite before reporting back.",
    "Patch ready: 4 files changed, all tests passing.",
  ],
  gemini: [
    "I ran a quick analysis — the approach holds up. Confidence is high with minor risks on latency.",
    "I'd suggest caching intermediate results; it should cut cost by roughly 18%.",
  ],
  llama: [
    "Local inference check complete. Results are consistent with the other agents.",
    "I can handle the bulk summarization to keep costs down.",
  ],
  mistral: [
    "Reviewed for edge cases — two inputs need extra validation. Details attached shortly.",
    "Fast pass done. Nothing blocking from my side.",
  ],
  voyager: [
    "I searched recent sources: three relevant references support this direction.",
    "Research summary compiled. Key finding: similar systems scale linearly up to 10 agents.",
  ],
};

/** Which agents answer a message sent to `target`. All Agents → up to 3 online agents, lead first. */
export function pickResponders(agents: AgentInfo[], target: string): AgentInfo[] {
  const online = agents.filter((a) => a.online);
  if (target !== ALL) return online.filter((a) => a.id === target);
  return online.slice(0, 3);
}

export function replyFor(agent: AgentInfo, turn: number): string {
  const list = replies[agent.id] ?? [`${agent.name} here — acknowledged, working on it.`];
  return list[turn % list.length] ?? list[0] ?? "";
}

export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    author: "claude",
    lead: true,
    time: "10:24 AM",
    text: "I've analyzed the requirements and drafted a high-level architecture. The plan focuses on modularity, scalability, and secure data flow. Key components include an event-driven core, isolated agent runtimes, and a shared memory layer.",
    attachment: { name: "architecture_plan.md", size: "12.4 KB" },
  },
  {
    id: "m2",
    author: "you",
    time: "10:25 AM",
    text: "Looks solid. Let's validate the cost estimates and get Gemini's perspective on the data synchronization strategy.",
  },
  {
    id: "m3",
    author: "gemini",
    time: "10:26 AM",
    text: "The sync strategy looks good. I recommend using CRDTs for conflict resolution and delta compression for bandwidth efficiency. I can run a quick simulation to validate.",
    progress: 65,
  },
  {
    id: "m4",
    author: "codex",
    time: "10:27 AM",
    text: "Simulation complete. With 6 agents and 1K events/sec, projected cost is $0.23/hour. Full report ready.",
    attachment: { name: "simulation_report.json", size: "8.7 KB" },
  },
];
