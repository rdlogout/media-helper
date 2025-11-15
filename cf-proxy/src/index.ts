import { Hono } from "hono";
import resizeHandler from "./resize";

const app = new Hono();
app.route("/resize", resizeHandler);

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

export default app;
