import { Hono } from "hono";
import { getThumbnail } from "./thumbnail";
import { getFileInfo } from "./info";

const actions = {
	thumbnail: getThumbnail,
	info: getFileInfo,
} as any;

const app = new Hono();

app.all("/:path", async (c, next) => {
	const path = c.req.param("path");
	const body = await c.req.formData();
	console.log(path, body);
	const action = actions[path];
	if (!action) return c.json({ error: "Invalid action" }, 400);
	const file = body.get("file") as File;
	if (action === getFileInfo) {
		const fileInfo = await getFileInfo(file);
		return c.json(fileInfo);
	}
	if (!file) return c.json({ error: "Invalid file" }, 400);
	const isMedia = file.type.startsWith("image") || file.type.startsWith("video") || file.type.startsWith("audio");
	if (!isMedia) return c.json({ error: "Invalid file type" }, 400);
	const [respFile, fileInfo] = await Promise.all([action(body, c), getFileInfo({ file })]);
	return new Response(respFile, {
		headers: {
			"Content-Type": respFile.type,
			"X-INFO": JSON.stringify(fileInfo),
		},
	});
});

export default {
	port: 3000,
	fetch: app.fetch,
};
