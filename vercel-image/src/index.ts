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
	const stream = await fetch(imageUrl).then((res) => res.arrayBuffer());
	const resizedStream = (await sharp(Buffer.from(stream)).resize(Number(width), Number(height)).toBuffer()) as any;
	return new Response(resizedStream, {
		headers: {
			"Content-Type": "image/jpeg",
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
