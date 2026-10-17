import type { ReactNode } from "react";
import { Settings, User, Bell, Keyboard, Database, Bot } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { prettyCombo, shortcuts } from "@/lib/persist";
import type { AgentInfo } from "@/lib/swarm";

export type Prefs = { name: string; email: string; saveHistory: boolean; notifyReplies: boolean; notifyCost: boolean; sound: boolean; defaultTarget: string };
export const defaultPrefs: Prefs = { name: "Alex Morgan", email: "alex@lilson.app", saveHistory: true, notifyReplies: true, notifyCost: true, sound: false, defaultTarget: "all" };

const field = "w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60";

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><span className="text-accent [&_svg]:size-4">{icon}</span>{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="flex items-center gap-3"><div className="flex-1"><div className="text-sm">{label}</div>{hint && <div className="text-xs text-muted-foreground">{hint}</div>}</div>{children}</div>;
}

export function SettingsView({ prefs, setPrefs, agents, onToggleAgent, onOpenAgent, onClearHistory, onReset }: {
  prefs: Prefs; setPrefs: (p: Prefs) => void; agents: AgentInfo[]; onToggleAgent: (id: string) => void; onOpenAgent: (id: string) => void;
  onClearHistory: () => void; onReset: () => void;
}) {
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs({ ...prefs, [k]: v });
  return (
    <section className="glass flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="grid size-11 place-items-center rounded-full border border-border"><Settings className="size-5" /></div>
        <div><div className="text-lg font-semibold">Settings</div><div className="text-xs text-muted-foreground">Changes save automatically</div></div>
      </div>
      <div className="grid flex-1 auto-rows-min gap-3 overflow-y-auto p-4 xl:grid-cols-2">
        <Card icon={<User />} title="Profile">
          <input className={field} value={prefs.name} onChange={(e) => set("name", e.target.value)} aria-label="Name" />
          <input className={field} value={prefs.email} onChange={(e) => set("email", e.target.value)} aria-label="Email" />
        </Card>
        <Card icon={<Bell />} title="Notifications">
          <Row label="Agent replies" hint="Notify when an agent answers"><Switch checked={prefs.notifyReplies} onCheckedChange={(v) => set("notifyReplies", v)} /></Row>
          <Row label="Cost alerts" hint="Warn when spending spikes"><Switch checked={prefs.notifyCost} onCheckedChange={(v) => set("notifyCost", v)} /></Row>
          <Row label="Sound"><Switch checked={prefs.sound} onCheckedChange={(v) => set("sound", v)} /></Row>
        </Card>
        <Card icon={<Bot />} title="Agents">
          <Row label="Default recipient" hint="Who new messages go to">
            <select className={`${field} w-40`} value={prefs.defaultTarget} onChange={(e) => set("defaultTarget", e.target.value)}>
              <option value="all" className="bg-popover">All Agents</option>
              {agents.map((a) => <option key={a.id} value={a.id} className="bg-popover">{a.name}</option>)}
            </select>
          </Row>
          {agents.map((a) => (
            <Row key={a.id} label={a.name} hint={a.model}>
              <button onClick={() => onOpenAgent(a.id)} className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-secondary">Configure</button>
              <Switch checked={a.online} onCheckedChange={() => onToggleAgent(a.id)} aria-label={`${a.name} online`} />
            </Row>
          ))}
        </Card>
        <div className="space-y-3">
          <Card icon={<Keyboard />} title="Keyboard shortcuts">
            {shortcuts.map((s) => (
              <Row key={s.combo} label={s.label}>
                <span className="flex gap-1">{prettyCombo(s.combo).map((k) => <kbd key={k} className="rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[11px]">{k}</kbd>)}</span>
              </Row>
            ))}
          </Card>
          <Card icon={<Database />} title="Data & history">
            <Row label="Save chat history" hint="Restore the conversation when you reopen the app"><Switch checked={prefs.saveHistory} onCheckedChange={(v) => set("saveHistory", v)} /></Row>
            <div className="flex gap-2">
              <button onClick={onClearHistory} className="flex-1 rounded-lg border border-border py-2 text-sm hover:bg-secondary">Clear chat history</button>
              <button onClick={onReset} className="flex-1 rounded-lg border border-destructive/50 py-2 text-sm text-destructive hover:bg-destructive/10">Reset everything</button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
