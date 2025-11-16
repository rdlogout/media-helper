import { Hono } from "hono";
import { getFileInfo } from "./info";
import resize from "./resize";
import { getThumbnail } from "./thumbnail";

const actions = {
	thumbnail: getThumbnail,
	info: getFileInfo,
} as any;

const app = new Hono();
const version = "v1";
app.get("/", (c) => {
	return c.json({ message: "Hello World", version });
});

app.route("/resize", resize);

app.all("/:path", async (c, next) => {
	const path = c.req.param("path");
	const action = actions[path];
	if (!action) return c.json({ error: "Invalid action" }, 400);

	// Only parse form data for POST/PUT/PATCH requests
	if (c.req.method === "GET" || c.req.method === "HEAD") {
		return c.json({ error: "Method not allowed" }, 405);
	}

	const body = await c.req.formData();
	const file = body.get("file") as File;
	if (action === getFileInfo) {
		const fileInfo = await getFileInfo(file);
		return c.json(fileInfo);
	}
	if (!file) return c.json({ error: "Invalid file" }, 400);
	const isMedia = file.type.startsWith("image") || file.type.startsWith("video") || file.type.startsWith("audio");
	if (!isMedia) return c.json({ error: "Invalid file type" }, 400);
	const [respFile, fileInfo] = await Promise.all([action(body, c), getFileInfo(file)]);
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
