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
	.get("/health", async (c) => {
		return c.text("OK");
	});
