import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const ORIGIN = "https://portfolio-angular-theo.vercel.app";

/** Limiteur factice : laisse tout passer, sauf si on lui demande de refuser. */
const limiter = (success = true) => ({ limit: vi.fn(async () => ({ success })) });

const call = async (request: Request, overrides: Partial<Env> = {}) => {
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, { ...env, RATE_LIMITER: limiter(), ...overrides } as Env, ctx);
  await waitOnExecutionContext(ctx);
  return response;
};

const post = async (body: unknown, init: RequestInit = {}) => {
  const request = new IncomingRequest("https://worker.test/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...(init.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
  return call(request, { STATICFORMS_API_KEY: "test-key" });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /contact", () => {
  it("forwards the submission to Static Forms with the server-side key", async () => {
    const upstream = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, message: "Form submission received" }), { status: 200 })
    );
    vi.stubGlobal("fetch", upstream);

    const response = await post({ name: "Alice", email: "alice@example.com", message: "Bonjour" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(upstream).toHaveBeenCalledOnce();

    const sent = JSON.parse(upstream.mock.calls[0][1].body as string);
    expect(sent.apiKey).toBe("test-key");
    expect(sent.name).toBe("Alice");
    expect(sent.replyTo).toBe("alice@example.com");
  });

  it("silently drops submissions that fill the honeypot", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);

    const response = await post({ name: "Bot", email: "bot@spam.io", message: "spam", honeypot: "rempli" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects an incomplete submission", async () => {
    const response = await post({ name: "Alice", email: "", message: "Bonjour" });
    expect(response.status).toBe(400);
  });

  it("rejects a disallowed origin", async () => {
    const response = await post(
      { name: "Alice", email: "alice@example.com", message: "Bonjour" },
      { headers: { Origin: "https://evil.example" } }
    );
    expect(response.status).toBe(403);
  });

  it("fails cleanly when the key is not configured", async () => {
    const request = new IncomingRequest("https://worker.test/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Bonjour" }),
    });
    const response = await call(request, { STATICFORMS_API_KEY: "" });
    expect(response.status).toBe(500);
  });

  it("rejects a request without Origin (scripts, curl)", async () => {
    const request = new IncomingRequest("https://worker.test/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Bonjour" }),
    });
    expect((await call(request)).status).toBe(403);
  });

  it("rejects an invalid email and oversized fields", async () => {
    expect((await post({ name: "Alice", email: "pas-un-email", message: "Bonjour" })).status).toBe(400);
    expect((await post({ name: "Alice", email: "alice@example.com", message: "x".repeat(5001) })).status).toBe(400);
  });

  it("rejects malformed JSON with a 400", async () => {
    const response = await post(undefined, { body: "{pas du json" });
    expect(response.status).toBe(400);
  });

  it("returns 429 once the rate limit is reached", async () => {
    const request = new IncomingRequest("https://worker.test/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Bonjour" }),
    });
    expect((await call(request, { RATE_LIMITER: limiter(false) as unknown as RateLimit })).status).toBe(429);
  });

  it("echoes only allowed origins in CORS headers", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ success: true }))));
    const ok = await post({ name: "Alice", email: "alice@example.com", message: "Bonjour" });
    expect(ok.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);

    const evil = await post({ name: "A", email: "a@b.co", message: "m" }, { headers: { Origin: "https://evil.example" } });
    expect(evil.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("POST / (chatbot)", () => {
  const ask = async (body: unknown, reply: unknown = { response: "ok" }) => {
    const run = vi.fn(async () => reply);
    const request = new IncomingRequest("https://worker.test/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify(body),
    });
    const response = await call(request, { AI: { run } as unknown as Ai });
    const [, options] = run.mock.calls[0] as unknown as [string, { messages: { role: string; content: string }[] }];
    const json = (await response.json()) as { response: string };
    return { status: response.status, reply: json.response, system: options.messages[0].content, user: options.messages[1].content };
  };

  it("forces the site's display language and sends the question untouched", async () => {
    const { status, system, user } = await ask({ prompt: "What are your skills?", lang: "de" });
    expect(status).toBe(200);
    expect(system).toContain("UNIQUEMENT en allemand");
    expect(system.trim().endsWith("Antworte ausschließlich auf Deutsch.")).toBe(true);
    expect(user).toBe("What are your skills?");
  });

  it("speaks about Théo in the third person, from the site's facts", async () => {
    const { system } = await ask({ prompt: "Hello", lang: "fr" });
    expect(system).toContain("Tu n'es pas Théo");
    expect(system).toContain("hôte de caisse chez E.Leclerc");
  });

  it("falls back to French for a missing or unknown language", async () => {
    expect((await ask({ prompt: "Hello" })).system).toContain("UNIQUEMENT en français");
    expect((await ask({ prompt: "Hello", lang: "xx" })).system).toContain("UNIQUEMENT en français");
  });

  it("strips a label and a duplicated answer in parentheses", async () => {
    const duplicated =
      "Réponse : Théo maîtrise Python et JavaScript. (Réponse : Théo a des compétences en Python et JavaScript.)";
    expect((await ask({ prompt: "Compétences ?" }, { response: duplicated })).reply).toBe(
      "Théo maîtrise Python et JavaScript."
    );
  });

  it("rejects an oversized prompt without calling the model", async () => {
    const run = vi.fn();
    const request = new IncomingRequest("https://worker.test/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ prompt: "x".repeat(501) }),
    });
    expect((await call(request, { AI: { run } as unknown as Ai })).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it("hides internal error details from the client", async () => {
    const run = vi.fn(async () => { throw new Error("secret internal detail"); });
    const request = new IncomingRequest("https://worker.test/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ prompt: "Hello" }),
    });
    const response = await call(request, { AI: { run } as unknown as Ai });
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("secret internal detail");
  });

  it("reads OpenAI-style replies too", async () => {
    const reply = { choices: [{ message: { content: "Théo vit à Mulhouse." } }] };
    expect((await ask({ prompt: "Où ?" }, reply)).reply).toBe("Théo vit à Mulhouse.");
  });
});

describe("GET /health", () => {
  it("responds ok", async () => {
    const request = new IncomingRequest("https://worker.test/health");
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(200);
    expect((await response.json() as { status: string }).status).toBe("ok");
  });
});
