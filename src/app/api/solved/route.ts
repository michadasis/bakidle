import { isModeId, type ModeId } from "@/game/modes";
import { globalDayIndex } from "@/game/time";

/**
 * How many people have solved a mode today, and where the caller came in.
 *
 * The store is Upstash Redis over its HTTP API, so there is no client library and no connection
 * to manage. Counting is a single INCR, which is exactly the operation this needs: no read then
 * write, so two people finishing at the same moment cannot take the same position.
 *
 * Nothing about a player is kept. A one way hash of the address is stored for two days purely so
 * that reloading the page does not count somebody twice, and it expires on its own.
 */
export const dynamic = "force-dynamic";

const BASE = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const COUNT_TTL = 60 * 60 * 24 * 3;
const SOLVER_TTL = 60 * 60 * 24 * 2;

/** Without a store the endpoint says so and the game simply leaves the counters out. */
function configured(): boolean {
  return Boolean(BASE && TOKEN);
}

async function redis(command: string): Promise<string | number | null> {
  const res = await fetch(`${BASE}/${command}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const body = (await res.json()) as { result: string | number | null };
  return body.result;
}

const countKey = (day: number, mode: ModeId) => `bakidle:solved:${day}:${mode}`;
const solverKey = (day: number, mode: ModeId, who: string) => `bakidle:solver:${day}:${mode}:${who}`;

function readMode(value: string | null): ModeId | null {
  return value && isModeId(value) ? value : null;
}

/** Truncated so it cannot be walked back to an address, and salted per day. */
async function visitorHash(request: Request, day: number): Promise<string> {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const data = new TextEncoder().encode(`${ip}:${day}:${process.env.SOLVE_SALT ?? "bakidle"}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request): Promise<Response> {
  const mode = readMode(new URL(request.url).searchParams.get("mode"));
  if (!mode) return Response.json({ error: "unknown mode" }, { status: 400 });
  if (!configured()) return Response.json({ count: null });

  try {
    const raw = await redis(`get/${countKey(globalDayIndex(), mode)}`);
    return Response.json({ count: Number(raw ?? 0) });
  } catch {
    // A counter is not worth failing a page over.
    return Response.json({ count: null });
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "expected json" }, { status: 400 });
  }
  const mode = readMode((body as { mode?: string })?.mode ?? null);
  if (!mode) return Response.json({ error: "unknown mode" }, { status: 400 });
  if (!configured()) return Response.json({ count: null, rank: null });

  // The day is the server's, never the caller's, so a wrong clock cannot write to another day.
  const day = globalDayIndex();
  try {
    const who = await visitorHash(request, day);
    const seen = solverKey(day, mode, who);
    const held = await redis(`get/${seen}`);
    if (held !== null) {
      // Already counted today: give back the same position rather than counting again.
      const count = Number((await redis(`get/${countKey(day, mode)}`)) ?? 0);
      return Response.json({ count, rank: Number(held), counted: false });
    }

    const rank = Number(await redis(`incr/${countKey(day, mode)}`));
    await redis(`expire/${countKey(day, mode)}/${COUNT_TTL}`);
    await redis(`set/${seen}/${rank}?EX=${SOLVER_TTL}`);
    return Response.json({ count: rank, rank, counted: true });
  } catch {
    return Response.json({ count: null, rank: null });
  }
}
