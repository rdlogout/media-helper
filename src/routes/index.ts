import { makeRequestToFFmpeg } from "@/lib/ffmpeg";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import fileInfo from "./file-info";
import resizeImage from "./resize-image";
import thumbnail from "./thumbnail";

export default new Hono()
	.use(contextStorage())
	// .use(compress())
	.route("/image/resize", resizeImage)
	.route("/info", fileInfo)
	.route("/thumbnail", thumbnail)
	.get("/test", async (c) => {
		let start = performance.now();
		const resp = await makeRequestToFFmpeg("/");
		const data = await resp.text();
		return c.json({ data, time: performance.now() - start });

		return c.text("OK");
	})
	.get("/health", async (c) => {
		return c.text("OK");
	});
