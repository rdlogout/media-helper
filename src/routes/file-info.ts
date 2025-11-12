import { makeRequestToFFmpeg } from "@/lib/ffmpeg";
import { Hono } from "hono";

type FileInfo = {
	height?: number;
	width?: number;
	duration?: number;
};
const getFileInfo = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	const resp = await makeRequestToFFmpeg("/info", "POST", formData);
	const data = await resp.json();
	return data as FileInfo;
};

export default new Hono()
	.get("/", async (c) => {
		const url = c.req.query("url") || "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
		const file = await fetch(url).then((res) => res.arrayBuffer());
		const start = performance.now();
		const fileObj = new File([file], "video.mp4", { type: "video/mp4" });
		const info = await getFileInfo(fileObj);
		return c.json({
			...info,
			time: performance.now() - start,
		});
	})
	.post("/", async (c) => {
		const body = await c.req.parseBody();
		const file = body.file as File;
		let start = performance.now();
		if (!file) return c.json({ error: "Invalid file" }, 400);
		const info = await getFileInfo(file);
		// console.log({ info });
		return c.json({
			...info,
			time: performance.now() - start,
		});
	});
