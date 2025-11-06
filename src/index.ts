import { Hono } from "hono";
import { getThumbnail } from "./thumbnail";
import { getFileInfo } from "./info";

const actions = {
	getThumbnail,
	getFileInfo,
} as any;

export default new Hono().all("/:path", async (c, next) => {
	const path = c.req.param("path");
	console.log(path);
	const body = await c.req.formData();
	console.log(body);
	const action = actions[path];
	if (!action) return c.json({ error: "Invalid action" }, 400);
	const [info, file] = await action(body, c);
	return new Response(file, {
		headers: {
			"Content-Type": file.type,
			"X-INFO": JSON.stringify(info),
		},
	});
});
