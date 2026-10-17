export const STORAGE_KEY = "lilson-desktop-state-v1";

export function loadState<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

/** Keyboard shortcut matcher: "mod" = Ctrl on Windows/Linux, Cmd on macOS. */
export function matchShortcut(
  e: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean },
  combo: string,
) {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop()!;
  const mod = parts.includes("mod");
  const shift = parts.includes("shift");
  return e.key.toLowerCase() === key && (e.metaKey || e.ctrlKey) === mod && e.shiftKey === shift;
}

export const shortcuts = [
  { combo: "mod+k", label: "Search agents & messages" },
  { combo: "mod+j", label: "Open notifications" },
  { combo: "/", label: "Focus message box" },
  { combo: "enter", label: "Send message" },
  { combo: "mod+enter", label: "Send message (from anywhere in the box)" },
  { combo: "mod+shift+o", label: "New session" },
];

export const prettyCombo = (c: string) =>
  c
    .split("+")
    .map((p) =>
      p === "mod" ? "Ctrl/⌘" : p === "shift" ? "Shift" : p === "enter" ? "Enter" : p.toUpperCase(),
    );
