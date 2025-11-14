import { Hono } from "hono";

export default new Hono()
	.get("/", async (c) => {
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
		const imgUrl = c.req.query("url") || c.req.query("img") || imageUrl;
		const inputBytes = await fetch(imgUrl)
			.then((res) => res.arrayBuffer())
			.then((buffer) => new Uint8Array(buffer));
		const quality = Number(url.searchParams.get("quality")) || undefined; // Let resizeImage handle default quality
		const size = url.searchParams.get("size");
		const height = url.searchParams.get("height") || size;
		const width = url.searchParams.get("width") || size;

		const file = await resizeImage({ file: new File([inputBytes], "image.jpg"), width, height, quality });

		const response = new Response(file.stream(), {
			headers: {
				"Content-Type": file.type,
				"Cache-Control": "max-age=604800",
				ETag: file.name,
			},
		});

		c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

		return response;
	})
	.post("/", async (c) => {
		const formData = await c.req.formData();
		const file = formData.get("file") as File;
		// console.log(file);
		// console.log("file", file?.name, file?.size);
		if (!file) return c.json({ error: "Invalid file" }, 400);
		try {
			const width = Number(formData.get("width")) || 0;
			const height = Number(formData.get("height")) || 0;
			const respFile = await resizeImage({ file, width, height });
			return new Response(respFile.stream());
		} catch (err) {
			console.log("err", err);
			return c.json({ error: "Internal server error" }, 500);
		}
	});
