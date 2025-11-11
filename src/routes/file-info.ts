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
	const resp = await makeRequestToFFmpeg("/info.json", "POST", formData);
	const data = await resp.json();
	return data as FileInfo;
};

export default new Hono().post("/", async (c) => {
	const body = await c.req.parseBody();
	const file = body.file as File;
	if (!file) return c.json({ error: "Invalid file" }, 400);
	const info = await getFileInfo(file);
	return c.json(info);
});
