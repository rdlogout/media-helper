import { serve } from "@hono/node-server";
import { Hono } from "hono";
import sharp from "sharp";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/image", async (c) => {
	const width = c.req.query("width") || "200";
	const height = c.req.query("height") || "200";
	const imageUrl = c.req.query("url") || "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";

	// Check if Cloudflare has cached this (check CF-Cache-Status header from request)
	const cfCacheStatus = c.req.header("cf-cache-status");
	console.log("Cloudflare Cache Status:", cfCacheStatus); // HIT, MISS, EXPIRED, etc.

	try {
		// Fetch the original image
		const stream = await fetch(imageUrl).then((res) => {
			if (!res.ok) throw new Error("Failed to fetch image");
			return res.arrayBuffer();
		});

		// Resize the image
		const resizedBuffer = await sharp(Buffer.from(stream)).resize(Number(width), Number(height)).jpeg({ quality: 85 }).toBuffer();

		// Set headers to enable Cloudflare caching
		return c.body(resizedBuffer as any, 200, {
			"Content-Type": "image/jpeg",
			// Browser cache for 1 hour, Cloudflare cache for 24 hours
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
			// Cloudflare-specific: cache for 7 days
			"CDN-Cache-Control": "max-age=604800",
			// Vary by query string (width, height, url)
			Vary: "Accept-Encoding",
			// Optional: Add ETag for conditional requests
			ETag: `"${width}-${height}-${Buffer.from(imageUrl).toString("base64").slice(0, 20)}"`,
			// Optional: Tell Cloudflare this is cacheable
			"X-Cache-Tag": "resized-image",
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
