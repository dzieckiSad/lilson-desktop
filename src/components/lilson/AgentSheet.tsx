import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { AgentInfo } from "@/lib/swarm";

export const modelOptions = [
  "Anthropic Claude 3.5 Sonnet", "OpenAI Codex", "Google Gemini 1.5 Pro", "Meta Llama 3.1 70B",
  "Mistral Large 2", "Custom Research Agent", "Custom Agent",
];

const field = "w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent/60";

export function AgentSheet({ agent, onClose, onSave }: { agent: AgentInfo | null; onClose: () => void; onSave: (a: AgentInfo) => void }) {
  const [draft, setDraft] = useState<AgentInfo | null>(agent);
  useEffect(() => setDraft(agent), [agent]);
  const d = draft;
  const options = d && !modelOptions.includes(d.model) ? [d.model, ...modelOptions] : modelOptions;

  return (
    <Sheet open={!!agent} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[400px] max-w-[92vw] overflow-y-auto border-border bg-popover/95 backdrop-blur-xl">
        {d && (
          <>
            <SheetHeader>
              <SheetTitle>{d.name}</SheetTitle>
              <SheetDescription>Agent details & configuration</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-6">
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-3">
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className={`text-xs ${d.online ? "text-primary" : "text-muted-foreground"}`}>{d.online ? "Online — receives tasks" : "Paused — ignores tasks"}</div>
                </div>
                <Switch checked={d.online} onCheckedChange={(v) => setDraft({ ...d, online: v })} aria-label="Online" />
              </div>
              <label className="block space-y-1.5"><span className="text-xs text-muted-foreground">Display name</span>
                <input className={field} value={d.name} onChange={(e) => setDraft({ ...d, name: e.target.value })} /></label>
              <label className="block space-y-1.5"><span className="text-xs text-muted-foreground">Model</span>
                <select className={field} value={d.model} onChange={(e) => setDraft({ ...d, model: e.target.value })}>
                  {options.map((m) => <option key={m} value={m} className="bg-popover">{m}</option>)}
                </select></label>
              <div className="space-y-2">
                <div className="flex text-xs text-muted-foreground">Creativity (temperature)<span className="ml-auto tabular-nums text-foreground">{(d.temperature ?? 0.7).toFixed(1)}</span></div>
                <Slider min={0} max={2} step={0.1} value={[d.temperature ?? 0.7]} onValueChange={([v]) => setDraft({ ...d, temperature: v ?? 0.7 })} />
              </div>
              <div className="space-y-2">
                <div className="flex text-xs text-muted-foreground">Max response length<span className="ml-auto tabular-nums text-foreground">{d.maxTokens ?? 4096} tokens</span></div>
                <Slider min={256} max={16384} step={256} value={[d.maxTokens ?? 4096]} onValueChange={([v]) => setDraft({ ...d, maxTokens: v ?? 4096 })} />
              </div>
              <label className="block space-y-1.5"><span className="text-xs text-muted-foreground">Role / instructions</span>
                <textarea rows={4} className={field} value={d.instructions ?? ""} placeholder="e.g. You review code for security issues."
                  onChange={(e) => setDraft({ ...d, instructions: e.target.value })} /></label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[["Tasks", "128"], ["Avg latency", "540ms"], ["Success", "99.2%"]].map(([l, v]) => (
                  <div key={l} className="rounded-lg border border-border bg-secondary/40 p-2"><div className="text-sm font-semibold text-foreground">{v}</div><div className="text-muted-foreground">{l}</div></div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2 text-sm hover:bg-secondary">Cancel</button>
                <button onClick={() => { if (d.name.trim()) onSave({ ...d, name: d.name.trim() }); }} className="glow-green flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground">Save changes</button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
