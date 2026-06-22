/**
 * A small typed wrapper around `fetch` for talking to this app's API routes.
 *
 * The API routes in `app/api/**` answer with a consistent shape:
 *   - success: an arbitrary JSON body (e.g. `{ user }`, `{ users }`)
 *   - failure: `{ error: string }` with a non-2xx status
 *
 * This client mirrors that contract. Every failure — HTTP errors, network
 * drops, aborts, and malformed JSON — is normalised into an `ApiError` so
 * callers only ever have to catch one thing.
 */

/** Shape of the error body returned by the API routes. */
interface ApiErrorBody {
  error?: string;
}

/**
 * Normalised error for every failed request.
 *
 * `status` is 0 when the request never produced an HTTP response (network
 * failure, timeout, abort), letting callers distinguish "server said no" from
 * "couldn't reach the server".
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /** True when the request never reached the server (offline, timeout, abort). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  /** JSON-serialisable request body. Sets `Content-Type: application/json`. */
  body?: unknown;
  /** Abort the request after this many milliseconds. */
  timeoutMs?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const DEFAULT_TIMEOUT_MS = 15_000;

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, headers, signal, ...rest } =
    options;

  // Wire up a timeout while still respecting any caller-supplied signal.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      // Send/receive the auth cookie on same-origin requests.
      credentials: "include",
      ...rest,
      signal: controller.signal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    // fetch only rejects for network-level problems (incl. aborts).
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(
      aborted
        ? `Request to ${path} timed out or was aborted`
        : `Network error while requesting ${path}`,
      0,
      error,
    );
  } finally {
    clearTimeout(timeout);
  }

  // 204 No Content (and other empty bodies) — nothing to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  // Tolerate empty or non-JSON bodies rather than throwing a raw SyntaxError.
  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new ApiError(
          `Expected JSON from ${path} but received an unparseable body`,
          response.status,
          text,
        );
      }
      // Non-ok + non-JSON: fall through to the HTTP-error path below.
    }
  }

  if (!response.ok) {
    const message =
      (data as ApiErrorBody | null)?.error ??
      response.statusText ??
      `Request to ${path} failed with status ${response.status}`;
    throw new ApiError(message, response.status, data ?? text);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};

export type ApiClient = typeof apiClient;
