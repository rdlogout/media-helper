import { fire } from "@fastly/hono-fastly-compute";
import { SimpleCache } from "fastly:cache";
import { Hono } from "hono";

const app = new Hono();

app.all("*", async (c) => {
	const url = new URL(c.req.url);
	// Construct the target URL.
	// Note: We use the pathname and search from the original request, but target the Vercel app.
	const targetUrl = new URL(url.pathname + url.search, "https://media-helper-31l8.vercel.app");

	// Use the full URL as the cache key.
	const cacheKey = targetUrl.toString();

	// 1. Try to get from SimpleCache
	// SimpleCache is a key-value store. It stores the body content.
	let entry = SimpleCache.get(cacheKey);
	let response;

	if (entry) {
		// HIT
		// Create a response from the cached body.
		// Note: SimpleCache does not store original response headers automatically.
		// We return the body with a generic 200 OK, or we would need to store metadata to reconstruct headers.
		response = new Response(entry.body, {
			status: 200,
			headers: {
				"X-CF-Proxy": "hit",
			},
		});
	} else {
		// MISS
		// Fetch from origin.
		// Note: 'vercel_app' backend must be defined in fastly.toml or allowed via dynamic backends.
		const responseFromOrigin = await fetch(targetUrl.toString(), {
			headers: {
				...c.req.header(),
				"X-worked": "true",
			},
			method: c.req.method,
			body: c.req.raw.body,
			redirect: "follow",
			backend: "vercel_app",
		});

		// Create the response to return.
		response = new Response(responseFromOrigin.body, responseFromOrigin);
		response.headers.set("X-CF-Proxy", "miss");

		// Cache if GET and 200 OK
		if (c.req.method === "GET" && response.status === 200) {
			// Clone the response to cache it because the body can only be read once.
			const responseToCache = response.clone();

			// Use waitUntil to keep the worker alive while caching
			c.executionCtx.waitUntil(
				new Promise((resolve) => {
					// SimpleCache.set schedules the write.
					// We use a default TTL of 60 seconds (adjust as needed).
					if (responseToCache.body) {
						SimpleCache.set(cacheKey, responseToCache.body, 60);
					}
					resolve(null);
				})
			);
		}
	}

	return response;
});

export default fire(app);
