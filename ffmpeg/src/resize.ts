import { Hono } from "hono";
import { etag } from "hono/etag";
import sharp from "sharp";
const imageUrl = "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";

type Props = {
	file: File;
	width?: number | string | null;
	height?: number | string | null;
	quality?: number | string | null;
	format?: string;
};

const getNumber = (value: number | string | null | undefined) => {
	if (value === null || value === undefined) return null;
	const val = Number(value);
	return Number.isNaN(val) || val <= 0 ? null : val;
};

const resizeImage = async (props: Props) => {
	const inputBytes = await props.file.arrayBuffer();
	const metaData = await sharp(Buffer.from(inputBytes)).metadata();
	const imageWidth = metaData.width || 0;
	const imageHeight = metaData.height || 0;
	const aspectRatio = imageWidth / imageHeight;
	let width = imageWidth;
	let height = imageHeight;
	const askedWidth = getNumber(props.width);
	const askedHeight = getNumber(props.height);
	if (askedWidth && askedHeight) {
		width = askedWidth;
		height = askedHeight;
	} else if (askedWidth) height = Math.round(askedWidth / aspectRatio);
	else if (askedHeight) width = Math.round(askedHeight * aspectRatio);

	const resizedStream = await sharp(Buffer.from(inputBytes)).resize(width, height).avif().toBuffer();
	return resizedStream;
};

export default new Hono().use("*", etag()).on(["POST", "GET"], "/", async (c) => {
	const isGet = c.req.method === "GET";
	const body = isGet ? c.req.query() : await c.req.parseBody();

	let file = body.file as File;
	const url = body.url as string | null;
	const start = performance.now();
	if (url) file = (await fetch(url).then(async (res) => new File([await res.arrayBuffer()], "image.avif"))) as File;
	if (!file) return c.json({ error: "Invalid file" }, 400);
	const format = (body.format as string) || "avif";
	try {
		const respFile = await resizeImage({
			file: file,
			width: body.width as number | string | null,
			height: body.height as number | string | null,
			quality: body.quality as number | string | null,
			format: format,
		});
		const duration = performance.now() - start;
		console.log("duration", duration);
		return new Response(Buffer.from(respFile), {
			status: 200,
			headers: {
				"Content-Type": "image/" + format,
				"X-TIME": `${duration}ms`,
				"Cache-Control": "public, max-age=604800, s-maxage=86400, stale-while-revalidate=604800",
			},
		});
	} catch (err) {
		console.log("err", err);
		return c.json({ error: "Internal server error" }, 500);
	}
});
