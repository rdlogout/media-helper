import { serve } from "@hono/node-server";
import { Hono } from "hono";
import sharp from "sharp";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!2");
});

app.get("/image", async (c) => {
	const width = c.req.query("width") || "200";
	const height = c.req.query("height") || "200";
	const imageUrl = c.req.query("url") || "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";

	// Log Cloudflare cache status (useful for debugging)
	const cfCacheStatus = c.req.header("cf-cache-status");
	if (cfCacheStatus) {
		console.log("CF-Cache-Status:", cfCacheStatus);
	}

	try {
		// Fetch the original image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			return c.json({ error: "Failed to fetch image" }, 400);
		}

		const arrayBuffer = await response.arrayBuffer();

		// Resize the image
		const resizedBuffer = await sharp(Buffer.from(arrayBuffer)).resize(Number(width), Number(height)).jpeg({ quality: 85 }).toBuffer();

		// Return with Cloudflare caching headers
		return c.body(resizedBuffer as any, 200, {
			"Content-Type": "image/jpeg",
			// Cache in browser for 1 hour, Cloudflare for 1 day
			"Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
			// Cloudflare-specific header (cache for 7 days)
			"CDN-Cache-Control": "max-age=604800",
			// Ensure different query params get different cache entries
			Vary: "Accept",
		});
	} catch (error) {
		console.error("Error processing image:", error);
		return c.json({ error: "Failed to process image" }, 500);
	}
});

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	}
);
