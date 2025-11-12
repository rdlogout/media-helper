import { Hono } from "hono";
import { compress } from "hono/compress";
import fileInfo from "./file-info";
import resizeImage from "./resize-image";

export default new Hono()
	.use(compress())
	.route("/image/resize", resizeImage)
	.route("/info", fileInfo)
	.get("/health", async (c) => {
		return c.text("OK");
	});
