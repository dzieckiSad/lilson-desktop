import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Menu, Search, Bell, Settings, ChevronDown, Plus, MoreVertical, Asterisk, Code2, Sparkles as Star4,
  Armchair, Globe, MessageCircle, Share2, FileText, Download, AudioLines, Send, ArrowUp, ArrowDown,
  Network, Bot, LayoutGrid, Workflow, Activity, Clock, ListChecks, ShieldCheck, Cpu, X,
} from "lucide-react";
import cat from "@/assets/lilson-cat.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lilson Desktop — Swarm Control Center" },
      { name: "description", content: "Orchestrate your AI agent swarm: live chat, agent status, performance, terminal and cost tracking." },
      { property: "og:title", content: "Lilson Desktop — Swarm Control Center" },
      { property: "og:description", content: "Live multi-agent swarm chat with monitoring widgets." },
    ],
  }),
  component: Index,
});

type Agent = { name: string; model: string; icon: ReactNode; tint: string };
const agents: Agent[] = [
  { name: "Claude", model: "Anthropic Claude 3.5 Sonnet", icon: <Asterisk className="size-6" />, tint: "text-accent" },
  { name: "Codex", model: "OpenAI Codex", icon: <Code2 className="size-6" />, tint: "text-foreground" },
  { name: "Gemini", model: "Google Gemini 1.5 Pro", icon: <Star4 className="size-6" />, tint: "text-accent" },
  { name: "Llama", model: "Meta Llama 3.1 70B", icon: <Armchair className="size-6" />, tint: "text-foreground" },
  { name: "Mistral", model: "Mistral Large 2", icon: <span className="text-xl font-bold">M</span>, tint: "text-primary" },
  { name: "Voyager", model: "Custom Research Agent", icon: <Globe className="size-6" />, tint: "text-foreground" },
];

function CatLogo({ size = 44 }: { size?: number }) {
  return (
    <div className="logo-ring shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <img src={cat.url} alt="Lilson cat logo" className="size-full object-cover" />
    </div>
  );
}

function Dot({ className = "" }) {
  return <span className={`inline-block size-2 rounded-full bg-primary glow-green ${className}`} />;
}

function IconBtn({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button aria-label={label} className="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground">
      {children}
    </button>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 md:px-5">
      <IconBtn label="Menu"><span onClick={onMenu}><Menu className="size-5" /></span></IconBtn>
      <CatLogo />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">Lilson Desktop</div>
        <div className="hidden text-xs text-muted-foreground sm:block">Orchestrate. Collaborate. Automate.</div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <div className="hidden items-center gap-1 md:flex">
          <IconBtn label="Search"><Search className="size-5" /></IconBtn>
          <IconBtn label="Notifications"><Bell className="size-5" /><Dot className="absolute right-2 top-2" /></IconBtn>
          <IconBtn label="Settings"><Settings className="size-5" /></IconBtn>
          <button className="glass ml-2 flex items-center gap-3 py-1.5 pl-1.5 pr-3">
            <div className="grid size-8 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">AM</div>
            <div className="text-left leading-tight"><div className="text-sm font-medium">Alex Morgan</div><div className="text-xs text-muted-foreground">Admin</div></div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>
        <button className="glow-green ml-2 flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30 md:px-4">
          <Plus className="size-4" /><span className="hidden sm:inline">New Session</span>
        </button>
      </div>
    </header>
  );
}

function AgentsPanel() {
  return (
    <aside className="glass flex h-full flex-col p-3">
      <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-xs font-semibold tracking-widest text-muted-foreground">
        AGENTS <Dot /> <span className="font-medium normal-case tracking-normal">6 Online</span>
        <Plus className="ml-auto size-4" />
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {agents.map((a, i) => (
          <div key={a.name} className={`flex items-center gap-3 rounded-xl border p-3 transition hover:bg-secondary ${i === 0 ? "glow border-accent/60 bg-accent/10" : "border-border bg-secondary/40"}`}>
            <div className={`grid size-12 place-items-center rounded-xl border border-border bg-background/50 ${a.tint}`}>{a.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{a.name}</div>
              <div className="truncate text-xs text-muted-foreground">{a.model}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Dot className="size-1.5" />Online</div>
            </div>
            <MoreVertical className="size-4 text-muted-foreground" />
          </div>
        ))}
      </div>
      <button className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 text-left transition hover:bg-secondary">
        <Plus className="size-5" />
        <div><div className="font-medium">Add Agent</div><div className="text-xs text-muted-foreground">Configure new agent</div></div>
      </button>
    </aside>
  );
}

function Attachment({ name, size }: { name: string; size: string }) {
  return (
    <div className="mt-3 flex gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm"><FileText className="size-4" />{name}<span className="text-muted-foreground">{size}</span></div>
      <button aria-label="Download" className="grid size-10 place-items-center rounded-lg border border-border bg-background/40 hover:bg-secondary"><Download className="size-4" /></button>
    </div>
  );
}

function Msg({ avatar, name, time, badge, children }: { avatar: ReactNode; name: string; time: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary text-accent">{avatar}</div>
      <div className="max-w-xl rounded-2xl border border-border bg-secondary/50 p-4">
        <div className="mb-1 flex items-center gap-2"><span className="font-semibold">{name}</span>{badge}<span className="text-xs text-muted-foreground">{time}</span></div>
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <section className="glass flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="grid size-11 place-items-center rounded-full border border-border"><MessageCircle className="size-5" /></div>
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">Swarm Chat <Dot /><span className="text-sm font-normal text-muted-foreground">Live</span></div>
          <div className="text-xs text-muted-foreground">Multi-agent collaboration in progress</div>
        </div>
        <button className="ml-auto flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm hover:bg-secondary"><Share2 className="size-4" /><span className="hidden sm:inline">Share</span></button>
        <MoreVertical className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-5">
        <Msg avatar={<Asterisk className="size-6" />} name="Claude" time="10:24 AM" badge={<span className="rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 text-xs text-accent">◆ Lead</span>}>
          I've analyzed the requirements and drafted a high-level architecture. The plan focuses on modularity, scalability, and secure data flow. Key components include an event-driven core, isolated agent runtimes, and a shared memory layer.
          <Attachment name="architecture_plan.md" size="12.4 KB" />
        </Msg>
        <div className="flex justify-end gap-3">
          <div className="glow max-w-xl rounded-2xl border border-accent/60 bg-accent/10 p-4">
            <div className="mb-1 flex justify-between gap-6"><span className="font-semibold">You</span><span className="text-xs text-muted-foreground">10:25 AM</span></div>
            <div className="text-sm leading-relaxed">Looks solid. Let's validate the cost estimates and get Gemini's perspective on the data synchronization strategy.</div>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">AM</div>
        </div>
        <Msg avatar={<Star4 className="size-5" />} name="Gemini" time="10:26 AM">
          The sync strategy looks good. I recommend using CRDTs for conflict resolution and delta compression for bandwidth efficiency. I can run a quick simulation to validate.
          <div className="mt-3 max-w-xs overflow-hidden rounded-lg border border-primary/40 bg-primary/10">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-primary"><AudioLines className="size-4" />Running simulation…<span className="ml-auto">65%</span></div>
            <div className="h-1 bg-primary/15"><div className="h-full w-[65%] bg-primary" /></div>
          </div>
        </Msg>
        <Msg avatar={<Code2 className="size-5" />} name="Codex" time="10:27 AM">
          Simulation complete. With 6 agents and 1K events/sec, projected cost is $0.23/hour. Full report ready.
          <Attachment name="simulation_report.json" size="8.7 KB" />
        </Msg>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/40 p-2 pl-4 focus-within:border-accent/60">
          <input placeholder="Ask the swarm anything…" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <button className="hidden items-center gap-1 px-2 text-sm sm:flex">All Agents <ChevronDown className="size-4" /></button>
          <button aria-label="Send" className="glow-green grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Send className="size-5" /></button>
        </div>
      </div>
    </section>
  );
}

function Spark({ seed, className = "text-primary" }: { seed: number; className?: string }) {
  const pts = Array.from({ length: 14 }, (_, i) => `${i * 7},${12 - Math.abs(Math.sin(i * seed) * 8) - i * 0.3}`).join(" ");
  return <svg viewBox="0 0 91 16" className={`h-4 w-24 ${className}`}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function WidgetTitle({ children, live }: { children: ReactNode; live?: string }) {
  return <div className="mb-3 flex items-center text-xs font-semibold tracking-widest text-muted-foreground">{children}{live && <span className="ml-auto flex items-center gap-1.5 font-medium normal-case tracking-normal"><Dot />{live}</span>}</div>;
}

function Widgets() {
  const costPts = [30, 34, 28, 36, 31, 40, 35, 44, 38, 46, 42, 50, 47, 55, 52, 58];
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto">
      <div className="glass p-4">
        <WidgetTitle>SWARM STATUS</WidgetTitle>
        <div className="flex items-center gap-4">
          <div className="glow-green grid size-24 place-items-center rounded-full border-4 border-primary/80 text-primary"><Network className="size-9" /></div>
          <div>
            <div className="font-semibold">All Systems Operational</div>
            <div className="text-sm text-muted-foreground">6/6 Agents Online</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-primary"><Dot />Healthy</div>
          </div>
        </div>
        <div className="mt-4 mb-2 text-sm font-semibold">Performance</div>
        {[["Tokens / sec", "18.7k", true], ["Latency", "612ms", false], ["Errors", "0.02%", false]].map(([l, v, up], i) => (
          <div key={l as string} className="flex items-center py-1.5 text-sm">
            <span className="w-24 text-muted-foreground">{l}</span><Spark seed={i + 1.3} /><span className="ml-auto font-medium">{v}</span>
            {up ? <ArrowUp className="ml-1 size-4 text-primary" /> : <ArrowDown className="ml-1 size-4 text-primary" />}
          </div>
        ))}
      </div>
      <div className="glass p-4">
        <WidgetTitle live="Live Logs">TERMINAL PREVIEW</WidgetTitle>
        <div className="font-mono space-y-1 rounded-lg border border-border bg-background/60 p-3 text-xs">
          <div>10:27:14 <span className="text-accent">[Claude]</span> Analysis complete</div>
          <div>10:27:14 <span className="text-accent">[Gemini]</span> Simulation started</div>
          <div>10:27:15 <span className="text-accent">[Codex]</span> Results generated</div>
          <div>10:27:16 <span className="text-primary">[Swarm]</span> Checkpoint saved</div>
          <div>&gt; <span className="animate-pulse">_</span></div>
        </div>
      </div>
      <div className="glass p-4">
        <WidgetTitle live="Live">COST TRACKER</WidgetTitle>
        <div className="text-sm text-muted-foreground">Session Cost</div>
        <div className="text-3xl font-semibold">$1.42 <span className="text-sm font-normal text-muted-foreground">/ hour</span></div>
        <svg viewBox="0 0 150 60" className="mt-2 h-16 w-full text-primary" preserveAspectRatio="none">
          <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".35" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
          <polygon fill="url(#cg)" points={`0,60 ${costPts.map((p, i) => `${i * 10},${60 - p}`).join(" ")} 150,60`} />
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={costPts.map((p, i) => `${i * 10},${60 - p}`).join(" ")} />
        </svg>
        <div className="mt-2 grid grid-cols-4 gap-1 text-center text-sm">
          {["15m", "1H", "6H", "24H"].map((t) => <button key={t} className={`rounded-lg py-1 ${t === "1H" ? "border border-border bg-secondary" : "text-muted-foreground"}`}>{t}</button>)}
        </div>
        <div className="mt-3 flex border-t border-border pt-3 text-sm"><span className="text-muted-foreground">Estimated Monthly Cost</span><span className="ml-auto font-semibold">$34.08</span></div>
      </div>
    </div>
  );
}

function StatusBar() {
  const items = [
    [<ShieldCheck key="a" className="size-3.5 text-primary" />, "Env: production"],
    [<Clock key="b" className="size-3.5" />, "Uptime 14d 6h"],
    [<ListChecks key="c" className="size-3.5" />, "Tasks 12 running"],
    [<Activity key="d" className="size-3.5" />, "Approvals 2 pending"],
    [<Cpu key="e" className="size-3.5" />, "System load 38%"],
  ] as const;
  return (
    <footer className="hidden items-center gap-6 px-5 py-2 text-xs text-muted-foreground lg:flex">
      {items.map(([i, t]) => <span key={t} className="flex items-center gap-1.5">{i}{t}</span>)}
      <span className="ml-auto flex items-center gap-1.5"><Dot className="size-1.5" />Connected</span>
    </footer>
  );
}

type Tab = "chat" | "agents" | "widgets" | "automation" | "settings";

function Index() {
  const [tab, setTab] = useState<Tab>("chat");
  const [drawer, setDrawer] = useState(false);
  const nav: [Tab, string, ReactNode][] = [
    ["chat", "Chat", <MessageCircle key="1" className="size-5" />],
    ["agents", "Agents", <Bot key="2" className="size-5" />],
    ["widgets", "Widgets", <LayoutGrid key="3" className="size-5" />],
    ["automation", "Automation", <Workflow key="4" className="size-5" />],
    ["settings", "Settings", <Settings key="5" className="size-5" />],
  ];
  return (
    <div className="flex h-dvh flex-col">
      <TopBar onMenu={() => setDrawer(true)} />

      {/* Desktop */}
      <main className="hidden min-h-0 flex-1 gap-3 px-4 lg:grid lg:grid-cols-[300px_1fr_340px]">
        <AgentsPanel />
        <Chat />
        <Widgets />
      </main>

      {/* Mobile / tablet */}
      <main className="min-h-0 flex-1 px-3 pb-2 lg:hidden">
        {tab === "chat" && <Chat />}
        {tab === "agents" && <AgentsPanel />}
        {tab === "widgets" && <Widgets />}
        {(tab === "automation" || tab === "settings") && (
          <div className="glass grid h-full place-items-center p-6 text-center text-muted-foreground">
            <div><CatLogo size={72} /><p className="mt-4 capitalize">{tab} — coming soon</p></div>
          </div>
        )}
      </main>
      <StatusBar />
      <nav className="glass mx-3 mb-3 grid grid-cols-5 lg:hidden">
        {nav.map(([k, l, i]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${tab === k ? "text-primary" : "text-muted-foreground"}`}>
            {i}{l}
          </button>
        ))}
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 flex bg-background/60 backdrop-blur-sm" onClick={() => setDrawer(false)}>
          <div className="h-full w-80 max-w-[85vw] p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-3 px-1"><CatLogo size={36} /><span className="font-semibold">Lilson Desktop</span>
              <button aria-label="Close" className="ml-auto" onClick={() => setDrawer(false)}><X className="size-5" /></button></div>
            <div className="h-[calc(100%-3rem)]"><AgentsPanel /></div>
          </div>
        </div>
      )}
    </div>
  );
}
