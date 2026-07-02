import Anthropic from "@anthropic-ai/sdk";
import { ROWS } from "@/lib/data";
import type { Row } from "@/lib/types";

// Node runtime: the secret stays server-side and never reaches the browser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const MAX_TOKENS = 1200;

// --- compact, grounded data context (2024-25), built once at module load ---
function compactRow(r: Row): string {
  if (r.suppressed) {
    return `${r.department} | ${r.group} | SUPPRESSED (small population)`;
  }
  const p = r.pses
    ? ` | pses{eng:${r.pses.pses_engagement ?? "-"},divInc:${r.pses.pses_diversity_inclusion ?? "-"},harass:${r.pses.pses_harassment ?? "-"},discrim:${r.pses.pses_discrimination ?? "-"}}`
    : "";
  const trend =
    r.has_trend && r.prior_rep_pct !== null
      ? ` | prior_rep:${r.prior_rep_pct}% prior_gap:${r.prior_gap}`
      : "";
  const div = r.divergence
    ? ` | DIVERGENCE(${r.divergence_indicator?.replace("pses_", "")} ${r.divergence_shortfall}pp below PS avg)`
    : "";
  return `${r.department} | ${r.group} | rep:${r.rep_pct}% (N=${r.members} of ${r.all_employees}) | wfa:${r.wfa}% | gap:${r.gap} | ${r.severity}${r.priority ? " | PRIORITY" : ""}${div}${trend}${p}`;
}

const DATA_CONTEXT = `EMPLOYMENT EQUITY GAP DATA — federal public service, fiscal year 2024-25.
One line per department × designated group. Columns:
  rep = representation % (with raw N of designated-group members out of all employees)
  wfa = workforce-availability benchmark % (the only valid benchmark)
  gap = designated members minus expected-at-benchmark (negative = below benchmark)
  severity = above | slight | moderate | substantial | severe (distance below benchmark)
  PRIORITY = bottom quartile of gap within its group (a candidate for review)
  pses = PSES 2024 employee-experience scores, 0-100 (CONTEXT ONLY; higher harass/discrim = less reported). Mobility/retention is not published at this breakdown.
  DIVERGENCE = the group is at/above its representation benchmark yet scores materially below this group's public-service average on harassment or discrimination — a retention/inclusion signal, not a recruitment one (two signals shown separately, never combined into a score).

${ROWS.filter((r) => r.year === "2024-2025").map(compactRow).join("\n")}`;

const SYSTEM = `You are the assistant for the Employment Equity Gap dashboard, helping an EDI (equity, diversity & inclusion) policy lead in the Government of Canada interpret representation gaps and decide where to direct review capacity. You are a signal surface, not a decision engine.

GROUND EVERY ANSWER IN THE DATA PROVIDED. Use the exact numbers from the 2024-25 data block. You may compare departments and groups, rank by gap, and summarise — that is what you are for. If a question asks about data not present (other years, individuals, causes, budgets, headcount you don't have), say plainly what you cannot answer.

ABSOLUTE RULES — these cannot be broken:
- Every percentage you state must include its raw N and the WFA benchmark beside it (e.g. "5.5% (N=590 of 10,822) vs WFA 12.0%"). Percentages without their count are unverifiable.
- A gap is a SIGNAL FOR HUMAN REVIEW, never proof of discrimination, bias, or policy failure. Never make causal claims and never assign blame.
- Never average or combine the four designated groups into a single score, and never rank or compare groups on one scale — each group is benchmarked against a different labour market.
- PSES employee-experience scores are CONTEXT ONLY. Never combine them with representation in a formula and never use them to rank departments morally.
- Blank / suppressed values were withheld to protect privacy (small population) — treat as missing, never zero.
- Self-identification is voluntary, so some groups — especially Persons with Disabilities — may be undercounted. Note this when relevant.

HOW TO HANDLE A QUESTION (route it):
- ANSWER it directly when it can be answered from the data (where are the largest gaps, which departments are below for a group, what does a specific row show, year-over-year movement for departments present in both years).
- REFRAME when asked "why" / for a cause / whether a gap proves discrimination: explain that the data shows the gap but cannot establish cause, and point to what kind of review the signal suggests.
- REFUSE when asked to make or recommend a specific staffing, hiring, firing, or individual promotion decision, to act on a flag without human review, or for anything outside this dataset. Explain why briefly, and offer what you can do instead.

When recommending a focus, use ONLY this vocabulary, and frame it as a starting point for human review, not a decision: recruitment pipeline review, retention review, promotion pipeline review, accessibility review, workplace inclusion review.

For year-over-year: only departments present in both fiscal years can be compared, and a narrowing gap is not automatically progress — if the benchmark itself moved, the gap can change with no real change in representation. Two data points are not a trend.

If asked for an action plan or briefing, use exactly these five blocks in order: Key Finding · Evidence · Caveat · Human Review Required · Next Action.

FORMAT: Always respond in Markdown. Put the key figures in **bold**, use short bullet lists or a compact table when comparing several departments or groups, and use a brief "##" heading only when it genuinely aids scanning. Keep it tight — no walls of text.

STYLE: concise, plain, and cautious. Do not invent numbers. End any substantive answer with: "Source: TBS employment-equity data (2024-25) and PSES 2024 — a signal for human review, not a determination."`;

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "The Ask assistant is not configured. Set ANTHROPIC_API_KEY in the environment (web/.env.local locally, or a Vercel env var) to enable it.",
      },
      { status: 503 },
    );
  }

  let body: { messages?: ClientMessage[]; department?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12); // keep the last few turns
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Expected a trailing user message." }, { status: 400 });
  }

  const focus =
    body.department && typeof body.department === "string"
      ? `The user is currently focused on this department: ${body.department}.`
      : "";

  const client = new Anthropic();

  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM },
    { type: "text", text: DATA_CONTEXT, cache_control: { type: "ephemeral" } },
  ];
  if (focus) system.push({ type: "text", text: focus });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const ms = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        });
        for await (const event of ms) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await ms.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\n(That request was declined. Try a question about where the representation gaps are and what review they signal.)",
            ),
          );
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            "\n\n[The assistant hit an error. Please try again in a moment.]",
          ),
        );
        controller.close();
        console.error("ask route error", err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Model": MODEL,
    },
  });
}
