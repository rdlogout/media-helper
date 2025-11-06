import { Context, Hono } from "hono";
import { unlink } from "node:fs/promises";

export const getThumbnail = async (body: FormData): Promise<File> => {
	const file = body.get("file") as File;
	const height = body.get("height")?.toString() || "200";
	const width = body.get("width")?.toString() || "200";
	const duration = body.get("duration")?.toString() || "0";
	const quality = body.get("quality")?.toString() || "80";
	const format = body.get("format")?.toString() || "webp"; // webp, jpg, png, avif, etc.

	const tmpInputFile = `/tmp/thumbnail-input-${Date.now()}`;
	await Bun.write(tmpInputFile, file);
	const tmpOutputFile = `/tmp/thumbnail-output-${Date.now()}.${format}`;

	const isVideo = file.type.startsWith("video");

	const ffmpegArgs = isVideo
		? [
				"-i",
				tmpInputFile,
				"-ss",
				duration,
				"-vframes",
				"1",
				"-vf",
				`scale=${width}:${height}:force_original_aspect_ratio=decrease`,
				"-c:v",
				format === "webp" ? "libwebp" : format,
				"-q:v",
				quality,
				"-y",
				tmpOutputFile,
		  ]
		: ["-i", tmpInputFile, "-vf", `scale=${width}:${height}`, "-c:v", format === "webp" ? "libwebp" : format, "-q:v", quality, "-y", tmpOutputFile];

	const proc = Bun.spawn(["ffmpeg", ...ffmpegArgs]);
	await proc.exited;

	const thumbnail = Bun.file(tmpOutputFile);

	const clean = async () => {
		await unlink(tmpInputFile);
		await unlink(tmpOutputFile);
	};

	clean();

	return new File([await thumbnail.arrayBuffer()], `${file.name.split(".")[0]}-thumbnail.${format}`, {
		type: `image/${format}`,
	});
};
