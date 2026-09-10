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
