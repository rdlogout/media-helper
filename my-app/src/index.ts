import { fire } from "@fastly/hono-fastly-compute";
import { SimpleCache } from "fastly:cache";
import { Hono } from "hono";

const app = new Hono();

app.all("*", async (c) => {
	const url = new URL(c.req.url);
	const targetUrl = new URL(url.pathname + url.search, "https://media-helper-31l8.vercel.app");
	const cacheKey = targetUrl.toString();

	// 1. Try to get from SimpleCache
	let entry = SimpleCache.get(cacheKey);
	let response;

	if (entry) {
		// HIT
		response = new Response(entry.body, {
			status: 200,
			headers: {
				"X-FASTLY-Proxy": "HIT",
			},
		});
	} else {
		// MISS - Fetch from origin
		const responseFromOrigin = await fetch(targetUrl.toString(), {
			headers: c.req.header(),
			method: c.req.method,
			body: c.req.raw.body,
		});

		// Cache if GET and 200 OK
		if (c.req.method === "GET" && responseFromOrigin.status === 200) {
			// Read the body once and store it
			const bodyBuffer = await responseFromOrigin.arrayBuffer();

			// Cache the body
			c.executionCtx.waitUntil(
				new Promise((resolve) => {
					SimpleCache.set(cacheKey, bodyBuffer, 60);
					resolve(null);
				})
			);

			// Create response from the buffer we just read
			response = new Response(bodyBuffer, {
				status: responseFromOrigin.status,
				headers: responseFromOrigin.headers,
			});
			response.headers.set("X-FASTLY-Proxy", "MISS");
		} else {
			// Not cacheable, just return as-is
			response = responseFromOrigin;
			response.headers.set("X-FASTLY-Proxy", "MISS");
		}
	}

	return response;
});

export default fire(app);
