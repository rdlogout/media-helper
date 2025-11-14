import { PhotonImage, resize, SamplingFilter } from "@/lib/photon";
import { Hono } from "hono";

type Props = {
	file: File;
	width?: number | string | null;
	height?: number | string | null;
	format?: string;
	quality?: number; // 1-100, lower = smaller file size

	mode?: "cover" | "contain";
	size?: string;
};
const getNumber = (value: number | string | null | undefined) => {
	if (value === null || value === undefined) {
		return null;
	}
	const val = Number(value);
	return Number.isNaN(val) || val <= 0 ? null : val;
};

const resizeImage = async (props: Props) => {
	console.log(props);
	const inputBytes = await props.file.arrayBuffer();
	const inputImage = PhotonImage.new_from_byteslice(new Uint8Array(inputBytes));
	const originalWidth = inputImage.get_width();
	const originalHeight = inputImage.get_height();
	console.log("paresed");
	let width = originalWidth;
	let height = originalHeight;

	// props.mode can be: 'contain' | 'cover' | 'stretch' | 'fit' (default)
	const mode = props.mode || "fit";
	const quality = props.quality ?? (props.width != null || props.height != null ? 65 : 75); // Lower quality for resized images
	// console.log("Quality calculation:", props.quality, "width:", props.width, "height:", props.height, "final quality:", quality);

	// Use JPEG for all images to allow quality control (WebP without quality control can inflate file sizes)
	const format = (props.format || "jpeg") as string;

	// If no dimensions specified and image is large, apply reasonable max dimensions for web optimization
	if (props.width == null && props.height == null && (originalWidth > 1200 || originalHeight > 1200)) {
		const maxDimension = 1200;
		if (originalWidth > originalHeight) {
			width = maxDimension;
			height = Math.round((maxDimension * originalHeight) / originalWidth);
		} else {
			height = maxDimension;
			width = Math.round((maxDimension * originalWidth) / originalHeight);
		}
		// console.log(`Resized large image from ${originalWidth}x${originalHeight} to ${width}x${height}`);
	}

	// console.log({
	// 	mode,
	// 	quality,
	// 	format,
	// 	originalWidth,
	// 	originalHeight,
	// 	targetWidth: props.width,
	// 	targetHeight: props.height,
	// 	getNumberWidth: getNumber(props.width),
	// 	getNumberHeight: getNumber(props.height),
	// });
	// console.log("Final dimensions before resize:", width, "x", height);

	// // Debug the if-else logic
	// console.log("Condition 1 (height only):", getNumber(props.height) !== null && getNumber(props.width) === null);
	// console.log("Condition 2 (width only):", getNumber(props.width) !== null && getNumber(props.height) === null);
	// console.log("Condition 3 (both):", getNumber(props.width) !== null && getNumber(props.height) !== null);
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

	try {
		// console.log("About to resize to:", width, "x", height);
		const outputImage = resize(inputImage, width, height, SamplingFilter.Lanczos3);

		// Get bytes with compression based on format
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
		const originalName = props.file.name;
		const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
		const newFileName = nameWithoutExt + extension;

		const compressedFile = new File([outputBytes], newFileName, { type: mimeType });

		// Log compression stats
		// console.log(`Original: ${(props.file.size / 1024).toFixed(2)} KB`);
		// console.log(`Compressed: ${(compressedFile.size / 1024).toFixed(2)} KB`);
		// console.log(`Reduction: ${(((props.file.size - compressedFile.size) / props.file.size) * 100).toFixed(1)}%`);

		return compressedFile;
	} catch (err) {
		console.log("err", err);
		return props.file;
	}
};
const imageUrl = "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";

export default new Hono()
	.get("/test", async (c) => {
		console.log(c.env);
		const stream = await fetch(imageUrl).then((res) => res.body);
		console.log(stream);
		const response = (await c.env.IMAGES.input(stream).transform({ rotate: 90 }).transform({ width: 128 }).transform({ blur: 20 }).output({ format: "image/avif" })).response();
		return response;
	})
	.get("/", async (c) => {
		const imgUrl = c.req.query("url") || c.req.query("img") || imageUrl;
		const width = c.req.query("width");
		const height = c.req.query("height");

		const cacheUrl = c.req.url;
		const cacheKey = new Request(cacheUrl.toString());
		const cache = caches.default;
		const cacheResponse = await cache.match(cacheKey);

		if (cacheResponse) {
			return new Response(cacheResponse.body, {
				headers: cacheResponse.headers,
			});
		}

		const stream = await fetch(imgUrl).then((res) => res.body);

		const response = (await c.env.IMAGES.input(stream).transform({ width, height }).output({ format: "image/avif" })).response();

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
