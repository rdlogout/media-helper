import { Hono } from "hono";
import { PhotonImage, resize, SamplingFilter } from "./lib";
import { cors } from "hono/cors";

const app = new Hono();
const imageUrl = "https://avatars.githubusercontent.com/u/314135";
app.use(
	cors({
		origin: "*",
		allowMethods: ["GET"],
		allowHeaders: ["*"],
	})
);
app.get("/", async (c) => {
	const cacheUrl = c.req.url;
	const cacheKey = new Request(cacheUrl.toString());
	const cache = caches.default;
	const cacheResponse = await cache.match(cacheKey);

	if (cacheResponse) {
		return new Response(cacheResponse.body, {
			headers: cacheResponse.headers,
		});
	}

	const url = new URL(c.req.url);
	const imgUrl = c.req.query("img") || imageUrl;
	const inputBytes = await fetch(imgUrl)
		.then((res) => res.arrayBuffer())
		.then((buffer) => new Uint8Array(buffer));

	const inputImage = PhotonImage.new_from_byteslice(inputBytes);
	const size = Number(url.searchParams.get("size"));
	const height = Number(url.searchParams.get("height")) || size || inputImage.get_height();
	const width = Number(url.searchParams.get("width")) || size || inputImage.get_width();

	const outputImage = resize(inputImage, width, height, SamplingFilter.Lanczos3);

	const outputBytes = outputImage.get_bytes_webp();

	inputImage.free();
	outputImage.free();

	const response = new Response(outputBytes as Uint8Array<ArrayBuffer>, {
		headers: {
			"Content-Type": "image/webp",
		},
	});

	c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

	return response;
});

export default app;
