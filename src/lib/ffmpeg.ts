import { Container, getRandom } from "@cloudflare/containers";
import { getContext } from "hono/context-storage";

const getFFmpeg = async () => {
	const c = getContext() as any;
	const container = await getRandom(c.env.FFMPEG);
	return container as Container;
};

export const makeRequestToFFmpeg = async (path: string, method: string = "POST", body?: BodyInit) => {
	const container = await getFFmpeg();
	const req = new Request(new URL(path, "http://example.com"), {
		method,
		body,
	});
	return container.fetch(req);
};
