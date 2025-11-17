import { PhotonImage, SamplingFilter, initPhoton, resize } from "@cf-wasm/photon/others";
import photonWasm from "@cf-wasm/photon/photon.wasm"; // Binary Uint8Array—no ?module, no early instantiation
import { fire } from "@fastly/hono-fastly-compute";
import { Hono } from "hono";

let photonReady: Promise<void> | null = null;

async function ensurePhotonReady() {
	if (!photonReady) {
		// Diagnostic: Log WASM global availability (should be 'object')
		console.log("WebAssembly global:", typeof WebAssembly);
		if (typeof WebAssembly === "undefined") {
			throw new Error("WebAssembly global unavailable—check runtime config");
		}
		photonReady = initPhoton({ wasm_bytes: photonWasm });
		await photonReady;
		console.log("Photon initialized successfully");
	} else {
		await photonReady;
	}
}

const app = new Hono();

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/resize", async (c) => {
	try {
		await ensurePhotonReady();
		const imgUrl = c.req.query("url") || c.req.query("img") || "https://i.ytimg.com/vi/xtJA_3kH4Qg/hqdefault.jpg";
		let targetWidth = Number(c.req.query("width")) || 300;
		let targetHeight = Number(c.req.query("height")) || 300;

		const res = await fetch(imgUrl);
		if (!res.ok) return c.text("Failed to fetch image", 400);
		const arrayBuffer = await res.arrayBuffer();
		const inputBytes = new Uint8Array(arrayBuffer);

		const inputImage = PhotonImage.new_from_byteslice(inputBytes);

		// Proportional resize if only one dim provided
		if (!c.req.query("width") || !c.req.query("height")) {
			const aspectRatio = inputImage.get_width() / inputImage.get_height();
			if (targetWidth && !targetHeight) targetHeight = Math.round(targetWidth / aspectRatio);
			else if (targetHeight && !targetWidth) targetWidth = Math.round(targetHeight * aspectRatio);
		}

		const outputImage = resize(inputImage, targetWidth, targetHeight, SamplingFilter.Lanczos3);
		const outputBytes = outputImage.get_bytes_webp();

		inputImage.free();
		outputImage.free();

		return new Response(outputBytes, {
			headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=3600" },
		});
	} catch (error) {
		console.error("Processing error:", error);
		return c.text(`Image processing failed: ${error.message}`, 500);
	}
});

export default fire(app);
