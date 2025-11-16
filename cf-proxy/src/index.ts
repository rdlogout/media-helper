import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import resizeHandler from "./resize";

const app = new Hono();
app.use(contextStorage());
// app.get(
// 	"*",
// 	cache({
// 		cacheName: "my-app",
// 		cacheControl: "max-age=3600",
// 	})
// );
app.route("/resize", resizeHandler);

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
