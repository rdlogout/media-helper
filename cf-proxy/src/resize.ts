import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon";
import { Hono } from "hono";

type Props = {
	file: File;
	width?: number | string | null;
	height?: number | string | null;
	format?: string;
	quality?: number; // 1-100, lower = smaller file size
	mode?: "cover" | "contain";
};
const getNumber = (value: number | string | null | undefined) => {
	if (value === null || value === undefined) {
		return null;
	}
	const val = Number(value);
	return Number.isNaN(val) || val <= 0 ? null : val;
};
const resizeWithPhoton = async (props: Props) => {
	const inputBytes = await props.file.arrayBuffer();
	const inputImage = PhotonImage.new_from_byteslice(new Uint8Array(inputBytes));
	const originalWidth = inputImage.get_width();
	const originalHeight = inputImage.get_height();
	let width = originalWidth;
	let height = originalHeight;
	const mode = props.mode || "fit";
	const quality = props.quality ?? (props.width != null || props.height != null ? 65 : 75);
	const format = (props.format || "jpeg") as string;
	if (props.width == null && props.height == null && (originalWidth > 1200 || originalHeight > 1200)) {
		const maxDimension = 1200;
		if (originalWidth > originalHeight) {
			width = maxDimension;
			height = Math.round((maxDimension * originalHeight) / originalWidth);
		} else {
			height = maxDimension;
			width = Math.round((maxDimension * originalWidth) / originalHeight);
		}
	}

	if (getNumber(props.height) !== null && getNumber(props.width) === null) {
		// Only height provided
		height = getNumber(props.height)!;
		const aspectRatio = originalWidth / originalHeight;
		width = Math.round(height * aspectRatio);
	} else if (getNumber(props.width) !== null && getNumber(props.height) === null) {
		// Only width provided
		// console.log("Entering width-only branch");
		width = getNumber(props.width)!;
		// console.log("Width set to:", width);
		const aspectRatio = originalHeight / originalWidth;
		// console.log("Aspect ratio:", aspectRatio);
		height = Math.round(width * aspectRatio);
		// console.log("Height calculated as:", height);
	} else if (getNumber(props.width) !== null && getNumber(props.height) !== null) {
		// Both dimensions provided
		const targetWidth = getNumber(props.width)!;
		const targetHeight = getNumber(props.height)!;

		switch (mode) {
			case "contain":
				// Fit inside the box, maintain aspect ratio
				const containScale = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
				width = Math.round(originalWidth * containScale);
				height = Math.round(originalHeight * containScale);
				break;

			case "cover":
				// Cover the entire box, maintain aspect ratio (may crop)
				const coverScale = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);
				width = Math.round(originalWidth * coverScale);
				height = Math.round(originalHeight * coverScale);
				break;
			default:
				// Fit (default), no cropping
				width = targetWidth;
				height = targetHeight;
				break;
		}
	}

	const outputImage = resize(inputImage, width, height, SamplingFilter.Lanczos3);
	let outputBytes: Uint8Array;
	let mimeType: string;
	let extension: string;

	switch (format) {
		case "webp":
			// WebP (smallest file size) - Photon doesn't support quality parameter for WebP
			outputBytes = outputImage.get_bytes_webp();
			mimeType = "image/webp";
			extension = ".webp";
			break;

		case "jpeg":
			// JPEG with quality
			outputBytes = outputImage.get_bytes_jpeg(quality);
			mimeType = "image/jpeg";
			extension = ".jpg";
			break;

		case "png":
			// PNG (lossless, larger file size)
			outputBytes = outputImage.get_bytes();
			mimeType = "image/png";
			extension = ".png";
			break;

		default:
			outputBytes = outputImage.get_bytes_webp();
			mimeType = "image/webp";
			extension = ".webp";
	}

	inputImage.free();
	outputImage.free();

	// Update filename extension if needed
	// const originalName = props.file.name;
	// const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
	// const newFileName = nameWithoutExt + extension;

	return new Response(outputBytes as any, {
		headers: {
			"Content-Type": mimeType,
		},
	});
};

export default new Hono().all("/", async (c) => {
	const isPOST = c.req.method === "POST";
	const formData = isPOST ? await c.req.formData() : null;
	const url = isPOST ? (formData.get("url") as string) : (c.req.query("url") as string);
	const width = isPOST ? (formData.get("width") as string) : (c.req.query("width") as string);
	const height = isPOST ? (formData.get("height") as string) : (c.req.query("height") as string);
	const format = isPOST ? (formData.get("format") as string) : (c.req.query("format") as string);
	const quality = isPOST ? (formData.get("quality") as string) : (c.req.query("quality") as string);
	const mode = isPOST ? (formData.get("mode") as string) : (c.req.query("mode") as string);

	const cacheUrl = c.req.url;
	const cacheKey = new Request(cacheUrl.toString());
	const cache = caches.default;
	const cacheResponse = await cache.match(cacheKey);
	if (cacheResponse) return cacheResponse;

	let file = isPOST ? (formData.get("file") as File) : null;
	if (url) file = await fetch(url).then(async (s) => new File([await s.arrayBuffer()], "def.jpg"));
	if (!file) return c.json({ error: "No file or URL provided" }, 400);
	const props: Props = {
		file,
		width: getNumber(width),
		height: getNumber(height),
		format: format as string,
		quality: getNumber(quality),
		mode: mode as any,
	};

	let response: Response;

	try {
		response = await resizeWithPhoton(props);
	} catch (error) {
		console.error("Resizing error:", error);
		return new Response(file.stream(), {
			headers: {
				"Content-Type": file.type,
				"x-error": `${JSON.stringify(error)}`,
			},
		});
	}

	if (!response) return new Response(file);
	c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
	return response;
});
