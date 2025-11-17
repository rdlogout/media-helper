import { Hono } from "hono";
import sharp from "sharp";

const app = new Hono();

const welcomeStrings = ["Hello Hono!", "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono"];

app.get("/", (c) => {
	return c.text(welcomeStrings.join("\n\n"));
});

app.get("/image", async (c) => {
	const width = c.req.query("width") || 200;
	const height = c.req.query("height") || 200;
	const imageUrl = c.req.query("url") || "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";
	let start = performance.now();
	const stream = await fetch(imageUrl).then((res) => res.arrayBuffer());
	console.log(`Downloaded image from ${imageUrl} in ${performance.now() - start}ms`);
	start = performance.now();
	const resizedStream = (await sharp(Buffer.from(stream)).resize(Number(width), Number(height)).toBuffer()) as any;
	console.log(`Resized image to ${width}x${height} in ${performance.now() - start}ms`);
	return new Response(resizedStream, {
		headers: {
			"Content-Type": "image/jpeg",
			"Cache-Control": "public, max-age=604800",
		},
	});
});

app.get("/images/:image", async (c) => {
	const width = c.req.query("width") || 200;
	const height = c.req.query("height") || 200;
	const imageUrl = c.req.query("url") || "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";
	return await fetch(imageUrl);
});

export default app;
