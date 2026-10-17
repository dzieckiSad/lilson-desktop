import { useState } from "react";
import { toast } from "sonner";
import { Play, Plus, Clock, Zap, GitBranch, Webhook, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { AgentInfo } from "@/lib/swarm";

export type Automation = { id: string; name: string; trigger: "schedule" | "event" | "webhook"; when: string; agents: string[]; enabled: boolean; lastRun: string; runs: number };

export const defaultAutomations: Automation[] = [
  { id: "a1", name: "Nightly code review", trigger: "schedule", when: "Every day at 02:00", agents: ["codex", "mistral"], enabled: true, lastRun: "Today 02:00", runs: 42 },
  { id: "a2", name: "Research digest", trigger: "schedule", when: "Mondays at 08:00", agents: ["voyager", "claude"], enabled: true, lastRun: "Mon 08:00", runs: 9 },
  { id: "a3", name: "On new pull request", trigger: "event", when: "GitHub: pull_request.opened", agents: ["codex", "claude"], enabled: false, lastRun: "3 days ago", runs: 17 },
  { id: "a4", name: "Cost alert escalation", trigger: "webhook", when: "Cost > $2.00 / hour", agents: ["claude"], enabled: true, lastRun: "Never", runs: 0 },
];

const triggerIcon = { schedule: Clock, event: GitBranch, webhook: Webhook };
const field = "w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60";

export function AutomationView({ items, setItems, agents, onRun }: {
  items: Automation[]; setItems: (a: Automation[]) => void; agents: AgentInfo[]; onRun: (a: Automation) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", trigger: "schedule" as Automation["trigger"], when: "", agents: [] as string[] });
  const name = (id: string) => agents.find((a) => a.id === id)?.name ?? id;
  const active = items.filter((i) => i.enabled).length;

  const create = () => {
    if (!draft.name.trim()) return;
    setItems([...items, { id: crypto.randomUUID(), ...draft, name: draft.name.trim(), when: draft.when || "Manual", agents: draft.agents.length ? draft.agents : ["claude"], enabled: true, lastRun: "Never", runs: 0 }]);
    toast.success("Automation created"); setOpen(false);
    setDraft({ name: "", trigger: "schedule", when: "", agents: [] });
  };

  return (
    <section className="glass flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="grid size-11 place-items-center rounded-full border border-border text-primary"><Zap className="size-5" /></div>
        <div><div className="text-lg font-semibold">Automation</div><div className="text-xs text-muted-foreground">{active} of {items.length} workflows active</div></div>
        <button onClick={() => setOpen(true)} className="glow-green ml-auto flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/30"><Plus className="size-4" />New workflow</button>
      </div>
      <div className="grid grid-cols-3 gap-3 p-4">
        {[["Runs this week", items.reduce((s, i) => s + i.runs, 0)], ["Active", active], ["Success rate", "98.7%"]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-border bg-secondary/40 p-3"><div className="text-xl font-semibold tabular-nums">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {items.map((a) => {
          const Icon = triggerIcon[a.trigger];
          return (
            <div key={a.id} className={`rounded-xl border p-4 transition ${a.enabled ? "border-border bg-secondary/40" : "border-border/50 bg-secondary/20 opacity-70"}`}>
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background/50 text-accent"><Icon className="size-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">{a.agents.map((id) => <span key={id} className="rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">{name(id)}</span>)}</div>
                </div>
                <Switch checked={a.enabled} onCheckedChange={(v) => setItems(items.map((x) => (x.id === a.id ? { ...x, enabled: v } : x)))} aria-label={`Enable ${a.name}`} />
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Last run: {a.lastRun}</span><span>· {a.runs} runs</span>
                <button onClick={() => setItems(items.filter((x) => x.id !== a.id))} aria-label="Delete" className="ml-auto rounded-md p-1.5 hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
                <button onClick={() => { setItems(items.map((x) => (x.id === a.id ? { ...x, lastRun: "Just now", runs: x.runs + 1 } : x))); onRun(a); }}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-foreground hover:bg-secondary"><Play className="size-3.5" />Run now</button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-popover/95 backdrop-blur-xl">
          <DialogHeader><DialogTitle>New workflow</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); create(); }} className="space-y-3">
            <input autoFocus required className={field} placeholder="Workflow name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              {(["schedule", "event", "webhook"] as const).map((t) => { const I = triggerIcon[t]; return (
                <button type="button" key={t} onClick={() => setDraft({ ...draft, trigger: t })} className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs capitalize ${draft.trigger === t ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}><I className="size-4" />{t}</button>
              ); })}
            </div>
            <input className={field} placeholder={draft.trigger === "schedule" ? "e.g. Every day at 09:00" : draft.trigger === "event" ? "e.g. GitHub: issue.opened" : "e.g. Cost > $3 / hour"} value={draft.when} onChange={(e) => setDraft({ ...draft, when: e.target.value })} />
            <div className="text-xs text-muted-foreground">Agents</div>
            <div className="flex flex-wrap gap-2">
              {agents.map((a) => { const on = draft.agents.includes(a.id); return (
                <button type="button" key={a.id} onClick={() => setDraft({ ...draft, agents: on ? draft.agents.filter((x) => x !== a.id) : [...draft.agents, a.id] })}
                  className={`rounded-lg border px-2.5 py-1 text-xs ${on ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>{a.name}</button>
              ); })}
            </div>
            <button type="submit" className="glow-green w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground">Create workflow</button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
