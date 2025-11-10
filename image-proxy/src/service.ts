import { WorkerEntrypoint } from "cloudflare:workers";
import { PhotonImage, resize, SamplingFilter } from "./lib";

const transform = async (file: File, props: any = {}) => {
	const inputImage = PhotonImage.new_from_image(file);
	const outputImage = resize(inputImage, inputImage.get_width() * (scale / 100), inputImage.get_height() * (scale / 100), SamplingFilter.Nearest);
};

export default class ImageProxy extends WorkerEntrypoint {
	// Currently, entrypoints without a named handler are not supported
	async fetch() {
		return new Response(null, { status: 404 });
	}

	async transform(file: File, scale: number) {
		const inputImage = PhotonImage.new_from_image(file);
		const outputImage = resize(inputImage, inputImage.get_width() * (scale / 100), inputImage.get_height() * (scale / 100), SamplingFilter.Nearest);

		const outputBytes = outputImage.get_bytes_webp();

		inputImage.free();
		outputImage.free();

		return new Response(outputBytes as Uint8Array<ArrayBuffer>, {
			headers: {
				"Content-Type": "image/webp",
			},
		});
		return file;
	}
}
