import { PhotonImage, resize, SamplingFilter } from "@/lib/photon";
import { Hono } from "hono";

type Props = {
	file: File;
	width?: number;
	height?: number;
	format?: string;
	size?: string;
};
const imageUrl = "https://avatars.githubusercontent.com/u/314135";

const resizeImage = async (props: Props) => {
	const inputBytes = await props.file.arrayBuffer();
	const inputImage = PhotonImage.new_from_byteslice(new Uint8Array(inputBytes));
	const height = Number(props.height) || inputImage.get_height();
	const width = Number(props.width) || inputImage.get_width();

	const outputImage = resize(inputImage, width, height, SamplingFilter.Lanczos3);
	const outputBytes = outputImage.get_bytes_webp();
	inputImage.free();
	outputImage.free();
	return new File([outputBytes], props.file.name, { type: "image/webp" });
};

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

		// c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

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
