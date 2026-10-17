import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Menu, Search, Bell, Settings, ChevronDown, Plus, MoreVertical, Asterisk, Code2, Sparkles as Star4,
  Armchair, Globe, MessageCircle, Share2, FileText, Download, AudioLines, Send, ArrowUp, ArrowDown,
  Network, Bot, LayoutGrid, Workflow, Activity, Clock, ListChecks, ShieldCheck, Cpu, X, User, LogOut,
  CreditCard, CheckCheck, AtSign, Pause, Play, Trash2, Check,
} from "lucide-react";
import cat from "@/assets/lilson-cat.jpg.asset.json";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { AgentSheet } from "@/components/lilson/AgentSheet";
import { AutomationView, defaultAutomations, type Automation } from "@/components/lilson/AutomationView";
import { SettingsView, defaultPrefs, type Prefs } from "@/components/lilson/SettingsView";
import { STORAGE_KEY, loadState, matchShortcut } from "@/lib/persist";
import {
  ALL, defaultAgents, initialMessages, nowTime, pickResponders, replyFor, type AgentInfo, type ChatMessage,
} from "@/lib/swarm";

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

const icons: Record<string, ReactNode> = {
  claude: <Asterisk className="size-6 text-accent" />,
  codex: <Code2 className="size-6" />,
  gemini: <Star4 className="size-6 text-accent" />,
  llama: <Armchair className="size-6" />,
  mistral: <span className="text-xl font-bold text-primary">M</span>,
  voyager: <Globe className="size-6" />,
};
const iconFor = (id: string) => icons[id] ?? <Bot className="size-6 text-primary" />;

const menuCls = "border-border bg-popover/95 backdrop-blur-xl";

function CatLogo({ size = 44 }: { size?: number }) {
  return (
    <div className="logo-ring shrink-0 overflow-hidden" style={{ width: size, height: size }}>
      <img src={cat.url} alt="Lilson cat logo" className="size-full object-cover" />
    </div>
  );
}
function Dot({ className = "", off = false }: { className?: string; off?: boolean }) {
  return <span className={`inline-block size-2 rounded-full ${off ? "bg-muted-foreground" : "bg-primary glow-green"} ${className}`} />;
}
const iconBtn = "relative grid size-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground";

type Notif = { id: number; title: string; body: string; read: boolean };

/* ---------------- Top bar ---------------- */
function TopBar(p: {
  onMenu: () => void; onNew: () => void; agents: AgentInfo[]; messages: ChatMessage[];
  onPickAgent: (id: string) => void; notifs: Notif[]; setNotifs: (n: Notif[]) => void; onSettings: () => void;
  searchOpen: boolean; setSearchOpen: (o: boolean) => void; notifOpen: boolean; setNotifOpen: (o: boolean) => void; userName: string; email: string;
}) {
  const [q, setQ] = useState("");
  const { searchOpen, setSearchOpen } = p;
  const unread = p.notifs.filter((n) => !n.read).length;
  const term = q.trim().toLowerCase();
  const agentHits = term ? p.agents.filter((a) => (a.name + a.model).toLowerCase().includes(term)) : p.agents;
  const msgHits = term ? p.messages.filter((m) => m.text.toLowerCase().includes(term)).slice(0, 4) : [];

  return (
    <header className="flex items-center gap-3 px-4 py-3 md:px-5">
      <button aria-label="Menu" className={iconBtn} onClick={p.onMenu}><Menu className="size-5" /></button>
      <CatLogo />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">Lilson Desktop</div>
        <div className="hidden text-xs text-muted-foreground sm:block">Orchestrate. Collaborate. Automate.</div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild><button aria-label="Search (Ctrl+K)" title="Search (Ctrl/⌘+K)" className={iconBtn}><Search className="size-5" /></button></PopoverTrigger>
          <PopoverContent align="end" className={`w-80 p-2 ${menuCls}`}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents and messages…"
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60" />
            <div className="mt-2 px-2 text-[11px] font-semibold tracking-widest text-muted-foreground">AGENTS</div>
            {agentHits.length === 0 && <div className="px-2 py-1 text-sm text-muted-foreground">No agents found</div>}
            {agentHits.map((a) => (
              <button key={a.id} onClick={() => { p.onPickAgent(a.id); setSearchOpen(false); setQ(""); }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-secondary">
                <span className="grid size-6 place-items-center [&_svg]:size-4">{iconFor(a.id)}</span>{a.name}
                <span className="ml-auto truncate text-xs text-muted-foreground">{a.model}</span>
              </button>
            ))}
            {msgHits.length > 0 && <div className="mt-2 px-2 text-[11px] font-semibold tracking-widest text-muted-foreground">MESSAGES</div>}
            {msgHits.map((m) => (
              <button key={m.id} onClick={() => { document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth", block: "center" }); setSearchOpen(false); }}
                className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm hover:bg-secondary">{m.text}</button>
            ))}
          </PopoverContent>
        </Popover>

        <Popover open={p.notifOpen} onOpenChange={p.setNotifOpen}>
          <PopoverTrigger asChild>
            <button aria-label="Notifications" title="Notifications (Ctrl/⌘+J)" className={iconBtn}><Bell className="size-5" />
              {unread > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className={`w-80 p-0 ${menuCls}`}>
            <div className="flex items-center border-b border-border px-4 py-3 text-sm font-semibold">Notifications
              <button className="ml-auto flex items-center gap-1 text-xs font-normal text-accent" onClick={() => p.setNotifs(p.notifs.map((n) => ({ ...n, read: true })))}>
                <CheckCheck className="size-3.5" />Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {p.notifs.map((n) => (
                <button key={n.id} onClick={() => p.setNotifs(p.notifs.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                  className="flex w-full gap-3 px-4 py-3 text-left hover:bg-secondary">
                  <Dot off={n.read} className="mt-1.5 shrink-0" />
                  <div><div className={`text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`}>{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div></div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button aria-label="Settings" className={`${iconBtn} hidden md:grid`} onClick={p.onSettings}><Settings className="size-5" /></button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="glass ml-1 flex items-center gap-3 py-1.5 pl-1.5 pr-1.5 md:pr-3">
              <div className="grid size-8 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">AM</div>
              <div className="hidden text-left leading-tight md:block"><div className="text-sm font-medium">{p.userName}</div><div className="text-xs text-muted-foreground">Admin</div></div>
              <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-56 ${menuCls}`}>
            <DropdownMenuLabel><div>{p.userName}</div><div className="text-xs font-normal text-muted-foreground">{p.email}</div></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={p.onSettings}><User />Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={p.onSettings}><Settings />Settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast("Billing: Pro plan · renews Nov 1")}><CreditCard />Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => toast("Signed out (demo)")}><LogOut />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button onClick={p.onNew} className="glow-green ml-2 flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/30 md:px-4">
          <Plus className="size-4" /><span className="hidden sm:inline">New Session</span>
        </button>
      </div>
    </header>
  );
}

/* ---------------- Agents ---------------- */
function AgentsPanel(p: {
  agents: AgentInfo[]; active: string; onSelect: (id: string) => void; onToggle: (id: string) => void;
  onRemove: (id: string) => void; onAdd: () => void; onDetails: (id: string) => void;
}) {
  const online = p.agents.filter((a) => a.online).length;
  return (
    <aside className="glass flex h-full flex-col p-3">
      <div className="flex items-center gap-2 px-2 pb-3 pt-1 text-xs font-semibold tracking-widest text-muted-foreground">
        AGENTS <Dot /> <span className="font-medium normal-case tracking-normal">{online} Online</span>
        <button aria-label="Add agent" onClick={p.onAdd} className="ml-auto rounded-md p-1 hover:bg-secondary"><Plus className="size-4" /></button>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {p.agents.map((a) => (
          <div key={a.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${p.active === a.id ? "glow border-accent/60 bg-accent/10" : "border-border bg-secondary/40 hover:bg-secondary"} ${a.online ? "" : "opacity-60"}`}>
            <button onClick={() => p.onSelect(a.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background/50">{iconFor(a.id)}</div>
              <div className="min-w-0">
                <div className="font-medium">{a.name}</div>
                <div className="truncate text-xs text-muted-foreground">{a.model}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Dot off={!a.online} className="size-1.5" />{a.online ? "Online" : "Paused"}</div>
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button aria-label={`${a.name} options`} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"><MoreVertical className="size-4" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={menuCls}>
                <DropdownMenuItem onSelect={() => p.onDetails(a.id)}><Settings />Details & config</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => p.onSelect(a.id)}><AtSign />Message {a.name}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => p.onToggle(a.id)}>{a.online ? <><Pause />Pause agent</> : <><Play />Resume agent</>}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={() => p.onRemove(a.id)}><Trash2 />Remove</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <button onClick={p.onAdd} className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 text-left transition hover:bg-secondary">
        <Plus className="size-5" />
        <div><div className="font-medium">Add Agent</div><div className="text-xs text-muted-foreground">Configure new agent</div></div>
      </button>
    </aside>
  );
}

/* ---------------- Chat ---------------- */
function downloadFile(name: string) {
  const blob = new Blob([`# ${name}\nGenerated by Lilson Desktop swarm (demo).\n`], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
  toast.success(`Downloaded ${name}`);
}

function Bubble({ m, agent }: { m: ChatMessage; agent?: AgentInfo | undefined }) {
  if (m.author === "you") {
    return (
      <div id={m.id} className="flex justify-end gap-3">
        <div className="glow max-w-xl rounded-2xl border border-accent/60 bg-accent/10 p-4">
          <div className="mb-1 flex justify-between gap-6"><span className="font-semibold">You</span><span className="text-xs text-muted-foreground">{m.time}</span></div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</div>
        </div>
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">AM</div>
      </div>
    );
  }
  return (
    <div id={m.id} className="flex gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary [&_svg]:size-5">{iconFor(m.author)}</div>
      <div className="max-w-xl rounded-2xl border border-border bg-secondary/50 p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold">{agent?.name ?? m.author}</span>
          {m.lead && <span className="rounded-md border border-accent/40 bg-accent/15 px-2 py-0.5 text-xs text-accent">◆ Lead</span>}
          <span className="text-xs text-muted-foreground">{m.time}</span>
        </div>
        <div className="text-sm leading-relaxed text-foreground/90">{m.text}</div>
        {m.progress !== undefined && (
          <div className="mt-3 max-w-xs overflow-hidden rounded-lg border border-primary/40 bg-primary/10">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-primary">
              <AudioLines className="size-4" />{m.progress < 100 ? "Running simulation…" : "Simulation complete"}<span className="ml-auto">{m.progress}%</span>
            </div>
            <div className="h-1 bg-primary/15"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${m.progress}%` }} /></div>
          </div>
        )}
        {m.attachment && (
          <div className="mt-3 flex gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm"><FileText className="size-4" />{m.attachment.name}<span className="text-muted-foreground">{m.attachment.size}</span></div>
            <button aria-label="Download" onClick={() => downloadFile(m.attachment!.name)} className="grid size-10 place-items-center rounded-lg border border-border bg-background/40 hover:bg-secondary"><Download className="size-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chat(p: {
  agents: AgentInfo[]; messages: ChatMessage[]; typing: string[]; target: string; setTarget: (t: string) => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [p.messages.length, p.typing.length]);
  useEffect(() => { inputRef.current?.focus(); }, [p.target]);
  const byId = (id: string) => p.agents.find((a) => a.id === id);
  const targetName = p.target === ALL ? "All Agents" : byId(p.target)?.name ?? "All Agents";
  const submit = () => { if (!text.trim()) return; p.onSend(text.trim()); setText(""); };

  return (
    <section className="glass flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="grid size-11 place-items-center rounded-full border border-border"><MessageCircle className="size-5" /></div>
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold">Swarm Chat <Dot /><span className="text-sm font-normal text-muted-foreground">Live</span></div>
          <div className="text-xs text-muted-foreground">{p.typing.length ? `${p.typing.map((t) => byId(t)?.name).join(", ")} typing…` : "Multi-agent collaboration in progress"}</div>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Session link copied"); }}
          className="ml-auto flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm hover:bg-secondary"><Share2 className="size-4" /><span className="hidden sm:inline">Share</span></button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button aria-label="Chat options" className="rounded-md p-1 text-muted-foreground hover:bg-secondary"><MoreVertical className="size-5" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={menuCls}>
            <DropdownMenuItem onSelect={() => downloadFile("swarm_chat_export.md")}><Download />Export chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-5">
        {p.messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-muted-foreground"><div><div className="mx-auto w-fit"><CatLogo size={72} /></div><p className="mt-4">New session. Ask the swarm anything.</p></div></div>
        )}
        {p.messages.map((m) => <Bubble key={m.id} m={m} agent={m.author === "you" ? undefined : byId(m.author)} />)}
        {p.typing.map((id) => (
          <div key={id} className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full border border-border bg-secondary [&_svg]:size-5">{iconFor(id)}</div>
            <div className="flex gap-1 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
              {[0, 150, 300].map((d) => <span key={d} className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 md:p-4">
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-2 rounded-2xl border border-border bg-background/40 p-2 pl-4 focus-within:border-accent/60">
          <input data-chat-input ref={inputRef} value={text} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }} onChange={(e) => setText(e.target.value)} placeholder={p.target === ALL ? "Ask the swarm anything…  ( / to focus )" : `Message ${targetName}…`}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-sm hover:bg-secondary">{targetName} <ChevronDown className="size-4" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-52 ${menuCls}`}>
              <DropdownMenuItem onSelect={() => p.setTarget(ALL)}><Network />All Agents{p.target === ALL && <Check className="ml-auto" />}</DropdownMenuItem>
              <DropdownMenuSeparator />
              {p.agents.map((a) => (
                <DropdownMenuItem key={a.id} disabled={!a.online} onSelect={() => p.setTarget(a.id)}>
                  <span className="[&_svg]:size-4">{iconFor(a.id)}</span>{a.name}{!a.online && <span className="text-xs">(paused)</span>}
                  {p.target === a.id && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button type="submit" aria-label="Send" disabled={!text.trim()} className="glow-green grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground transition disabled:opacity-50"><Send className="size-5" /></button>
        </form>
      </div>
    </section>
  );
}

/* ---------------- Widgets ---------------- */
function Spark({ seed }: { seed: number }) {
  const pts = Array.from({ length: 14 }, (_, i) => `${i * 7},${12 - Math.abs(Math.sin(i * seed) * 8) - i * 0.3}`).join(" ");
  return <svg viewBox="0 0 91 16" className="h-4 w-24 text-primary"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function WidgetTitle({ children, live }: { children: ReactNode; live?: string }) {
  return <div className="mb-3 flex items-center text-xs font-semibold tracking-widest text-muted-foreground">{children}{live && <span className="ml-auto flex items-center gap-1.5 font-medium normal-case tracking-normal"><Dot />{live}</span>}</div>;
}
const ranges = { "15m": { cost: 1.38, seed: 0.7 }, "1H": { cost: 1.42, seed: 1.1 }, "6H": { cost: 1.29, seed: 1.9 }, "24H": { cost: 1.17, seed: 2.6 } } as const;
type Range = keyof typeof ranges;

function Widgets({ agents, logs, tokens, onClearLogs }: { agents: AgentInfo[]; logs: string[]; tokens: number; onClearLogs: () => void }) {
  const [range, setRange] = useState<Range>("1H");
  const online = agents.filter((a) => a.online).length;
  const healthy = online === agents.length;
  const r = ranges[range];
  const pts = useMemo(() => Array.from({ length: 16 }, (_, i) => 28 + i * 1.7 + Math.sin(i * r.seed) * 8), [r.seed]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo({ top: 9999 }); }, [logs.length]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto">
      <div className="glass p-4">
        <WidgetTitle>SWARM STATUS</WidgetTitle>
        <div className="flex items-center gap-4">
          <div className={`grid size-24 place-items-center rounded-full border-4 ${healthy ? "glow-green border-primary/80 text-primary" : "border-chart-3 text-chart-3"}`}><Network className="size-9" /></div>
          <div>
            <div className="font-semibold">{healthy ? "All Systems Operational" : "Partially Degraded"}</div>
            <div className="text-sm text-muted-foreground">{online}/{agents.length} Agents Online</div>
            <div className={`mt-1 flex items-center gap-1.5 text-sm ${healthy ? "text-primary" : "text-chart-3"}`}><Dot off={!healthy} />{healthy ? "Healthy" : "Attention"}</div>
          </div>
        </div>
        <div className="mb-2 mt-4 text-sm font-semibold">Performance</div>
        {([["Tokens / sec", `${(tokens / 1000).toFixed(1)}k`, true], ["Latency", "612ms", false], ["Errors", "0.02%", false]] as const).map(([l, v, up], i) => (
          <div key={l} className="flex items-center py-1.5 text-sm">
            <span className="w-24 text-muted-foreground">{l}</span><Spark seed={i + 1.3} /><span className="ml-auto font-medium tabular-nums">{v}</span>
            {up ? <ArrowUp className="ml-1 size-4 text-primary" /> : <ArrowDown className="ml-1 size-4 text-primary" />}
          </div>
        ))}
      </div>
      <div className="glass p-4">
        <WidgetTitle live="Live Logs">TERMINAL PREVIEW</WidgetTitle>
        <div ref={logRef} className="font-mono max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border bg-background/60 p-3 text-xs">
          {logs.map((l, i) => { const m = l.match(/^(\S+) (\[[^\]]+\])(.*)$/); return m ? <div key={i}>{m[1]} <span className={m[2] === "[Swarm]" ? "text-primary" : "text-accent"}>{m[2]}</span>{m[3]}</div> : <div key={i}>{l}</div>; })}
          <div>&gt; <span className="animate-pulse">_</span></div>
        </div>
        <button onClick={onClearLogs} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Clear logs</button>
      </div>
      <div className="glass p-4">
        <WidgetTitle live="Live">COST TRACKER</WidgetTitle>
        <div className="text-sm text-muted-foreground">Session Cost · {range}</div>
        <div className="text-3xl font-semibold tabular-nums">${r.cost.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ hour</span></div>
        <svg viewBox="0 0 150 60" className="mt-2 h-16 w-full text-primary" preserveAspectRatio="none">
          <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".35" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
          <polygon fill="url(#cg)" points={`0,60 ${pts.map((v, i) => `${i * 10},${60 - v}`).join(" ")} 150,60`} />
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts.map((v, i) => `${i * 10},${60 - v}`).join(" ")} />
        </svg>
        <div className="mt-2 grid grid-cols-4 gap-1 text-center text-sm">
          {(Object.keys(ranges) as Range[]).map((t) => <button key={t} onClick={() => setRange(t)} className={`rounded-lg py-1 transition ${t === range ? "border border-border bg-secondary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>)}
        </div>
        <div className="mt-3 flex border-t border-border pt-3 text-sm"><span className="text-muted-foreground">Estimated Monthly Cost</span><span className="ml-auto font-semibold tabular-nums">${(r.cost * 24).toFixed(2)}</span></div>
      </div>
    </div>
  );
}

function StatusBar({ tasks }: { tasks: number }) {
  const items = [
    [<ShieldCheck key="a" className="size-3.5 text-primary" />, "Env: production"],
    [<Clock key="b" className="size-3.5" />, "Uptime 14d 6h"],
    [<ListChecks key="c" className="size-3.5" />, `Tasks ${tasks} running`],
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

/* ---------------- Page ---------------- */
type Tab = "chat" | "agents" | "widgets" | "automation" | "settings";
type View = "dashboard" | "automation" | "settings";
const stamp = () => new Date().toLocaleTimeString([], { hour12: false });
const initialLogs = [
  "10:27:14 [Claude] Analysis complete", "10:27:14 [Gemini] Simulation started",
  "10:27:15 [Codex] Results generated", "10:27:16 [Swarm] Checkpoint saved",
];
const initialNotifs: Notif[] = [
  { id: 1, title: "Simulation finished", body: "Codex attached simulation_report.json", read: false },
  { id: 2, title: "Approval needed", body: "Claude requests deploy to staging", read: false },
  { id: 3, title: "Cost alert", body: "Session spend passed $1.00 / hour", read: true },
];
const defaults = { agents: defaultAgents, messages: initialMessages, notifs: initialNotifs, automations: defaultAutomations, prefs: defaultPrefs };

function focusChatInput() {
  const el = Array.from(document.querySelectorAll<HTMLInputElement>("[data-chat-input]")).find((x) => x.offsetParent !== null);
  el?.focus();
}

function Index() {
  const [tab, setTab] = useState<Tab>("chat");
  const [view, setView] = useState<View>("dashboard");
  const [drawer, setDrawer] = useState(false);
  const [agents, setAgents] = useState<AgentInfo[]>(defaultAgents);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [notifs, setNotifs] = useState<Notif[]>(initialNotifs);
  const [automations, setAutomations] = useState<Automation[]>(defaultAutomations);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [loaded, setLoaded] = useState(false);
  const [typing, setTyping] = useState<string[]>([]);
  const [target, setTarget] = useState<string>(ALL);
  const [activeAgent, setActiveAgent] = useState("claude");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", model: "" });
  const [tokens, setTokens] = useState(18700);
  const [tasks, setTasks] = useState(12);
  const turn = useRef(0);
  const [logs, setLogs] = useState<string[]>(initialLogs);
  const log = (l: string) => setLogs((x) => [...x.slice(-40), `${stamp()} ${l}`]);

  // restore saved state after mount
  useEffect(() => {
    const st = loadState(localStorage.getItem(STORAGE_KEY), defaults);
    setAgents(st.agents); setNotifs(st.notifs); setAutomations(st.automations);
    setPrefs({ ...defaultPrefs, ...st.prefs });
    if (st.prefs.saveHistory !== false) setMessages(st.messages.map((m) => (m.progress !== undefined ? { ...m, progress: 100 } : m)));
    const t = st.prefs.defaultTarget;
    if (t && (t === ALL || st.agents.some((a) => a.id === t && a.online))) setTarget(t);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ agents, notifs, automations, prefs, messages: prefs.saveHistory ? messages : [] }));
  }, [loaded, agents, notifs, automations, prefs, messages]);

  useEffect(() => {
    const t = setInterval(() => {
      setTokens((v) => Math.max(12000, Math.round(v + (Math.random() - 0.5) * 900)));
      setMessages((ms) => (ms.some((m) => m.progress !== undefined && m.progress < 100)
        ? ms.map((m) => (m.progress !== undefined && m.progress < 100 ? { ...m, progress: Math.min(100, m.progress + 5) } : m)) : ms));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const send = (text: string) => {
    const responders = pickResponders(agents, target);
    setMessages((m) => [...m, { id: crypto.randomUUID(), author: "you", text, time: nowTime() }]);
    log(`[Swarm] Task dispatched to ${target === ALL ? "all agents" : responders[0]?.name ?? target}`);
    if (!responders.length) { toast.error("That agent is paused — resume it or pick another."); return; }
    const myTurn = turn.current++;
    setTasks((t) => t + 1);
    responders.forEach((a, i) => {
      setTimeout(() => setTyping((t) => [...t, a.id]), 300 + i * 700);
      setTimeout(() => {
        setTyping((t) => t.filter((x) => x !== a.id));
        setMessages((m) => [...m, { id: crypto.randomUUID(), author: a.id, text: replyFor(a, myTurn), time: nowTime(), lead: a.id === "claude" && i === 0 }]);
        log(`[${a.name}] Response delivered`);
        if (i === responders.length - 1) {
          setTasks((t) => Math.max(0, t - 1));
          if (prefs.notifyReplies) setNotifs((n) => [{ id: Date.now(), title: `${a.name} replied`, body: text.slice(0, 60), read: false }, ...n].slice(0, 20));
        }
      }, 1600 + i * 1400);
    });
  };

  const selectAgent = (id: string) => {
    setActiveAgent(id);
    const a = agents.find((x) => x.id === id);
    if (a?.online) setTarget(id); else toast(`${a?.name} is paused`);
    setTab("chat"); setView("dashboard"); setDrawer(false);
  };
  const toggleAgent = (id: string) => {
    const a = agents.find((x) => x.id === id)!;
    setAgents((as) => as.map((x) => (x.id === id ? { ...x, online: !x.online } : x)));
    log(`[Swarm] ${a.name} ${a.online ? "paused" : "resumed"}`);
    if (a.online && target === id) setTarget(ALL);
  };
  const saveAgent = (u: AgentInfo) => {
    const prev = agents.find((x) => x.id === u.id);
    setAgents((as) => as.map((x) => (x.id === u.id ? u : x)));
    if (prev && prev.online !== u.online) log(`[Swarm] ${u.name} ${u.online ? "resumed" : "paused"}`);
    if (prev && prev.model !== u.model) log(`[Swarm] ${u.name} switched to ${u.model}`);
    if (!u.online && target === u.id) setTarget(ALL);
    setDetailsId(null); toast.success(`${u.name} updated`);
  };
  const removeAgent = (id: string) => {
    const a = agents.find((x) => x.id === id)!;
    setAgents((as) => as.filter((x) => x.id !== id));
    if (target === id) setTarget(ALL);
    toast(`${a.name} removed`);
  };
  const addAgent = () => {
    if (!newAgent.name.trim()) return;
    const id = newAgent.name.trim().toLowerCase().replace(/\W+/g, "-") + "-" + Date.now().toString(36);
    setAgents((as) => [...as, { id, name: newAgent.name.trim(), model: newAgent.model.trim() || "Custom Agent", online: true }]);
    log(`[Swarm] ${newAgent.name.trim()} joined the swarm`);
    toast.success(`${newAgent.name.trim()} added`);
    setNewAgent({ name: "", model: "" }); setAddOpen(false);
  };
  const newSession = () => {
    setMessages([]); setTyping([]); setTarget(ALL); setTab("chat"); setView("dashboard");
    log("[Swarm] New session started"); toast.success("New session started");
  };
  const goView = (v: View) => { setView(v); setTab(v === "dashboard" ? "chat" : v); setDrawer(false); };

  // keyboard shortcuts
  const newSessionRef = useRef(newSession); newSessionRef.current = newSession;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typingInField = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? "");
      if (matchShortcut(e, "mod+k")) { e.preventDefault(); setNotifOpen(false); setSearchOpen(true); }
      else if (matchShortcut(e, "mod+j")) { e.preventDefault(); setSearchOpen(false); setNotifOpen((o) => !o); }
      else if (matchShortcut(e, "mod+shift+o")) { e.preventDefault(); newSessionRef.current(); }
      else if (e.key === "/" && !typingInField) { e.preventDefault(); setView("dashboard"); setTab("chat"); setTimeout(focusChatInput, 50); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const agentsPanel = <AgentsPanel agents={agents} active={activeAgent} onSelect={selectAgent} onToggle={toggleAgent} onRemove={removeAgent} onAdd={() => setAddOpen(true)} onDetails={setDetailsId} />;
  const chat = <Chat agents={agents} messages={messages} typing={typing} target={target} setTarget={setTarget} onSend={send} />;
  const widgets = <Widgets agents={agents} logs={logs} tokens={tokens} onClearLogs={() => setLogs([])} />;
  const automation = <AutomationView items={automations} setItems={setAutomations} agents={agents}
    onRun={(a) => { log(`[Swarm] Workflow "${a.name}" started`); toast.success(`Running “${a.name}”`); }} />;
  const settings = <SettingsView prefs={prefs} setPrefs={setPrefs} agents={agents} onToggleAgent={toggleAgent} onOpenAgent={setDetailsId}
    onClearHistory={() => { setMessages([]); toast.success("Chat history cleared"); }}
    onReset={() => { localStorage.removeItem(STORAGE_KEY); setAgents(defaultAgents); setMessages(initialMessages); setNotifs(initialNotifs); setAutomations(defaultAutomations); setPrefs(defaultPrefs); setTarget(ALL); toast.success("Everything reset"); }} />;

  const nav: [Tab, string, ReactNode][] = [
    ["chat", "Chat", <MessageCircle key="1" className="size-5" />],
    ["agents", "Agents", <Bot key="2" className="size-5" />],
    ["widgets", "Widgets", <LayoutGrid key="3" className="size-5" />],
    ["automation", "Automation", <Workflow key="4" className="size-5" />],
    ["settings", "Settings", <Settings key="5" className="size-5" />],
  ];
  const views: [View, string, ReactNode][] = [
    ["dashboard", "Swarm Chat", <MessageCircle key="a" className="size-4" />],
    ["automation", "Automation", <Workflow key="b" className="size-4" />],
    ["settings", "Settings", <Settings key="c" className="size-4" />],
  ];

  return (
    <div className="flex h-dvh flex-col">
      <Toaster theme="dark" position="top-center" />
      <TopBar onMenu={() => setDrawer(true)} onNew={newSession} agents={agents} messages={messages} onPickAgent={selectAgent}
        notifs={notifs} setNotifs={setNotifs} onSettings={() => goView("settings")}
        searchOpen={searchOpen} setSearchOpen={setSearchOpen} notifOpen={notifOpen} setNotifOpen={setNotifOpen} userName={prefs.name} email={prefs.email} />

      <div className="hidden gap-1 px-4 pb-3 lg:flex">
        {views.map(([v, l, i]) => (
          <button key={v} onClick={() => goView(v)} className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition ${view === v ? "glow border border-accent/50 bg-accent/10 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>{i}{l}</button>
        ))}
      </div>

      <main className="hidden min-h-0 flex-1 gap-3 px-4 lg:grid lg:grid-cols-[300px_1fr_340px]">
        {agentsPanel}
        {view === "dashboard" ? chat : view === "automation" ? automation : settings}
        {widgets}
      </main>

      <main className="min-h-0 flex-1 px-3 pb-2 lg:hidden">
        {tab === "chat" && chat}
        {tab === "agents" && agentsPanel}
        {tab === "widgets" && widgets}
        {tab === "automation" && automation}
        {tab === "settings" && settings}
      </main>
      <StatusBar tasks={tasks} />
      <nav className="glass mx-3 mb-3 grid grid-cols-5 lg:hidden">
        {nav.map(([k, l, i]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${tab === k ? "text-primary" : "text-muted-foreground"}`}>{i}{l}</button>
        ))}
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-40 flex bg-background/60 backdrop-blur-sm" onClick={() => setDrawer(false)}>
          <div className="flex h-full w-80 max-w-[85vw] flex-col p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-3 px-1"><CatLogo size={36} /><span className="font-semibold">Lilson Desktop</span>
              <button aria-label="Close" className="ml-auto" onClick={() => setDrawer(false)}><X className="size-5" /></button></div>
            <div className="glass mb-2 p-1.5">
              {views.map(([v, l, i]) => (
                <button key={v} onClick={() => goView(v)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${view === v ? "bg-accent/15 text-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{i}{l}</button>
              ))}
            </div>
            <div className="min-h-0 flex-1">{agentsPanel}</div>
          </div>
        </div>
      )}

      <AgentSheet agent={agents.find((a) => a.id === detailsId) ?? null} onClose={() => setDetailsId(null)} onSave={saveAgent} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className={menuCls}>
          <DialogHeader><DialogTitle>Add Agent</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); addAgent(); }} className="space-y-3">
            <input autoFocus required value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} placeholder="Agent name (e.g. Scout)"
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60" />
            <input value={newAgent.model} onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })} placeholder="Model (e.g. Custom QA Agent)"
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60" />
            <button type="submit" className="glow-green w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground">Add to swarm</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
