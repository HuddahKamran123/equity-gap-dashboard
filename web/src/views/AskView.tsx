"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { departmentsForYear } from "@/lib/data";
import { CURRENT_YEAR } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Which departments have the largest gaps for Persons with Disabilities?",
  "Where is Indigenous representation furthest below benchmark?",
  "What kind of review does the RCMP gap for Persons with Disabilities signal?",
  "Why do these gaps exist?",
];

export default function AskView() {
  const departments = useState(() => departmentsForYear(CURRENT_YEAR))[0];
  const [department, setDepartment] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, department: department || undefined }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        appendToLast(j?.error ?? "The assistant is unavailable right now.");
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLast(dec.decode(value, { stream: true }));
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } catch {
      appendToLast("\n\n[Connection error. Please try again.]");
    } finally {
      setBusy(false);
    }
  }

  function appendToLast(chunk: string) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === "assistant") copy[copy.length - 1] = { ...last, content: last.content + chunk };
      return copy;
    });
  }

  return (
    <div className="animate-fade-up">
      <header className="border-b border-rule pb-5">
        <p className="tracking-cap text-[11px] text-muted">Ask · grounded in the data</p>
        <h2 className="font-display mt-2 text-[1.8rem] leading-tight text-ink">
          Ask about the gaps
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-soft">
          A real assistant, grounded in the 2024-25 data. It cites the count and
          benchmark behind every figure, refuses staffing decisions and causal
          claims, and frames findings as signals for human review. It is not a
          decision-maker.
        </p>
      </header>

      {/* focus selector */}
      <div className="my-4 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <label htmlFor="ask-dept">Focus (optional)</label>
        <select
          id="ask-dept"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-sm border border-rule-strong bg-paper-raised px-2 py-1 text-ink"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* conversation */}
      <div
        ref={scrollRef}
        className="max-h-[52vh] min-h-[180px] overflow-y-auto rounded-sm border border-rule bg-paper-raised p-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[13px] text-muted">Try one of these:</p>
            <div className="mx-auto mt-3 flex max-w-xl flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-sm border border-rule-strong bg-paper px-3 py-2 text-left text-[13px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {messages.map((m, i) => (
              <li key={i} className={m.role === "user" ? "text-right" : ""}>
                <span className="tracking-cap mb-1 block text-[10px] text-faint">
                  {m.role === "user" ? "You" : "Assistant"}
                </span>
                {m.role === "user" ? (
                  <div className="inline-block max-w-[42rem] whitespace-pre-wrap rounded-sm bg-ink px-3 py-2 text-left text-[14px] leading-relaxed text-paper">
                    {m.content}
                  </div>
                ) : (
                  <div className="md max-w-[44rem] rounded-sm border border-rule bg-paper px-4 py-3 text-left text-[14px] leading-relaxed text-ink">
                    {m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : busy && i === messages.length - 1 ? (
                      <span className="text-faint">…</span>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex gap-2"
      >
        <label htmlFor="ask-input" className="sr-only">
          Ask a question about the data
        </label>
        <input
          id="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the gaps…"
          disabled={busy}
          className="flex-1 rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-[14px] text-ink placeholder:text-faint disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-sm bg-accent px-4 py-2 text-[14px] font-medium text-paper transition-colors hover:bg-accent-bright disabled:opacity-50"
        >
          {busy ? "…" : "Ask"}
        </button>
      </form>

      <p className="mt-3 text-[11px] text-faint">
        Answers are generated by Claude from the embedded data and may contain
        errors — verify against the Explore and Present views before acting. A
        human makes every consequential decision.
      </p>
    </div>
  );
}
