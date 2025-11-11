import { Hono } from "hono";
import resizeImage from "./resize-image";
import fileInfo from "./file-info";

export default new Hono()
	.route("/image/resize", resizeImage)
	.route("/info", fileInfo)
	.get("/health", async (c) => {
		return c.text("OK");
	});
