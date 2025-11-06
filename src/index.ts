import { Hono } from "hono";
import { getThumbnail } from "./thumbnail";
import { getFileInfo } from "./info";

const actions = {
	thumbnail: getThumbnail,
	info: getFileInfo,
} as any;

export default new Hono().all("/:path", async (c, next) => {
	const path = c.req.param("path");
	console.log(path);
	const body = await c.req.formData();
	console.log(body);
	const action = actions[path];
	if (!action) return c.json({ error: "Invalid action" }, 400);
	const file = body.get("file") as File;
	const [respFile, fileInfo] = await Promise.all([action(body, c), getFileInfo(file)]);
	return new Response(respFile, {
		headers: {
			"Content-Type": respFile.type,
			"X-INFO": JSON.stringify(fileInfo),
		},
	});
});
