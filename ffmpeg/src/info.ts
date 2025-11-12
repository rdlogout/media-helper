import ffmpeg from "fluent-ffmpeg";
import { unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const getFileInfo = async (file: File) => {
	const type = file.type.split("/")[0];
	const tempPath = join(tmpdir(), file.name);
	await writeFile(tempPath, Buffer.from(await file.arrayBuffer()));

	try {
		return await new Promise((resolve, reject) => {
			ffmpeg.ffprobe(tempPath, (err, metadata) => {
				if (err) {
					return reject(err);
				}

				const videoStream = metadata.streams.find((s) => s.codec_type === "video");
				const audioStream = metadata.streams.find((s) => s.codec_type === "audio");

				if (type === "image") {
					const { width, height } = videoStream || {};
					resolve({ width, height });
				} else if (type === "video") {
					const { duration } = metadata.format || {};
					const { width, height } = videoStream || {};
					resolve({ duration, width, height });
				} else if (type === "audio") {
					const { duration } = metadata.format || {};
					resolve({ duration });
				} else {
					reject(new Error("Unsupported file type"));
				}
			});
		});
	} finally {
		await unlink(tempPath);
	}
};
