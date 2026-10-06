import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const ORIGIN = "https://portfolio-angular-theo.vercel.app";

const post = async (body: unknown, init: RequestInit = {}) => {
  const request = new IncomingRequest("https://worker.test/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...(init.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, { ...env, STATICFORMS_API_KEY: "test-key" }, ctx);
  await waitOnExecutionContext(ctx);
  return response;
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
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, { ...env, STATICFORMS_API_KEY: "" }, ctx);
    await waitOnExecutionContext(ctx);
    expect(response.status).toBe(500);
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
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, { ...env, AI: { run } } as unknown as Env, ctx);
    await waitOnExecutionContext(ctx);
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
