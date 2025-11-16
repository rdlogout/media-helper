import type { Handle } from "@sveltejs/kit";
let counter = 22;
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith("/custom")) {
		counter++;
		return new Response("custom response" + counter);
	}

	const response = await resolve(event);
	return response;
};
