//entry.js
import { handleSvelteKitRequest } from "svelte-adapter-fastly";

/// <reference types="@fastly/js-compute" />
addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

/**
 * @param {FetchEvent} event
 */
async function handleRequest(event) {
	// Get the request from the client.
	const req = event.request;

	const headers = new Headers();
	headers.set("Content-Type", "text/plain");

	//Requests with edge in URL will return plain non sveltekit response
	if (req.url.includes("edge")) {
		return new Response("Hi from the edge", {
			status: 200,
			headers,
		});
	} else {
		//everyone else gets the kit!
		return handleSvelteKitRequest(event);
	}
}
