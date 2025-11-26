import { Hono } from "hono";

const app = new Hono();

function shouldCache(url: URL): boolean {
    const pathname = url.pathname.toLowerCase();
    const staticExtensions = [".js", ".css", ".json", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".webm", ".mp3", ".pdf", ".zip"];
    return staticExtensions.some((ext) => pathname.endsWith(ext));
}

function getCacheTTL(url: URL): number {
    const pathname = url.pathname.toLowerCase();
    if (pathname.match(/\.(woff2?|ttf|eot)$/)) {
        return 31536000;
    }
    if (pathname.match(/\.[a-f0-9]{8,}\.(js|css)$/) || pathname.match(/[._-][a-f0-9]{8,}\.(js|css)$/)) {
        return 31536000;
    }
    if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        return 2592000;
    }
    if (pathname.match(/\.(js|css)$/)) {
        return 86400;
    }
    return 3600;
}

app.all("*", async (c) => {
    const url = new URL(c.req.url);
    url.protocol = "https:";
    url.hostname = "tinvif-web-vercel.vercel.app";

    const method = c.req.method;
    const isGet = method === "GET";
    const noCacheHdrs = `${c.req.header("Cache-Control") || ""} ${c.req.header("Pragma") || ""}`;
    const bypassCache = /\bno-cache\b|\bno-store\b|\bmax-age=0\b/i.test(noCacheHdrs);
    const shouldCacheRequest = isGet && shouldCache(url) && !bypassCache;

    if (!shouldCacheRequest) {
        const passthrough = new Request(url.toString(), {
            method,
            headers: c.req.raw.headers,
            body: method === "GET" || method === "HEAD" ? undefined : c.req.raw.body,
        });
        return fetch(passthrough, { cf: { cacheEverything: false } });
    }

    const ttl = getCacheTTL(url);

    let cacheKeyUrl = url.toString();
    if (url.pathname.match(/\.[a-f0-9]{8,}\.(js|css)$/) || url.pathname.match(/[._-][a-f0-9]{8,}\.(js|css)$/)) {
        const u = new URL(url.toString());
        u.search = "";
        cacheKeyUrl = u.toString();
    }
    const cacheKey = new Request(cacheKeyUrl, {
        method: "GET",
        headers: c.req.raw.headers,
    });

    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
        return cached;
    }

    const originRequest = new Request(url.toString(), {
        method: "GET",
        headers: c.req.raw.headers,
    });

    let response = await fetch(originRequest, {
        cf: {
            cacheEverything: true,
            cacheTtl: ttl,
            cacheTtlByStatus: { "200-299": ttl, 301: 3600, 404: 600, "500-599": 0 },
            minify: { html: true, css: true, javascript: false },
        },
        signal: c.req.raw.signal,
    });

    const headers = new Headers(response.headers);
    if (headers.has("Set-Cookie")) headers.delete("Set-Cookie");
    headers.set("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl}, immutable, stale-while-revalidate=${ttl}`);
    headers.append("Vary", "Accept-Encoding");

    response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });

    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
});

export default app;
