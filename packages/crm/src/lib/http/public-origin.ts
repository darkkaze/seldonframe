/**
 * Origin (scheme + host) the client actually used for this request.
 *
 * Behind a reverse proxy, `next start` builds a route handler's
 * `request.url` from its own listen address (https://localhost:3000), so
 * URLs derived from it leave the public domain. The proxy's forwarded
 * headers carry the real scheme and host (including workspace
 * subdomains); `request.url` is only the last resort.
 */
export function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const host =
    firstHeaderValue(request, "x-forwarded-host") ?? firstHeaderValue(request, "host") ?? url.host;
  const proto = firstHeaderValue(request, "x-forwarded-proto") ?? url.protocol.replace(/:$/, "");
  return `${proto}://${host}`;
}

function firstHeaderValue(request: Request, name: string): string | null {
  return request.headers.get(name)?.split(",")[0]?.trim() || null;
}
