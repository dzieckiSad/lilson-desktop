import { describe, expect, it } from "vitest";
import { loadState, matchShortcut } from "@/lib/persist";

const ev = (key: string, o: Partial<{ metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }> = {}) => ({ key, metaKey: false, ctrlKey: false, shiftKey: false, ...o });

describe("chat history restore", () => {
  it("restores saved messages", () => {
    expect(loadState(JSON.stringify({ messages: [1, 2] }), { messages: [] as number[] }).messages).toEqual([1, 2]);
  });
  it("falls back when nothing or broken data is saved", () => {
    expect(loadState(null, { messages: [9] }).messages).toEqual([9]);
    expect(loadState("{oops", { messages: [9] }).messages).toEqual([9]);
  });
});

describe("shortcuts", () => {
  it("Ctrl+K and Cmd+K open search", () => {
    expect(matchShortcut(ev("k", { ctrlKey: true }), "mod+k")).toBe(true);
    expect(matchShortcut(ev("k", { metaKey: true }), "mod+k")).toBe(true);
    expect(matchShortcut(ev("k"), "mod+k")).toBe(false);
  });
  it("Ctrl+J opens notifications", () => {
    expect(matchShortcut(ev("j", { ctrlKey: true }), "mod+j")).toBe(true);
  });
});
