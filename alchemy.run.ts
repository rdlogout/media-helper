import alchemy from "alchemy";
import { Container, Worker } from "alchemy/cloudflare";
const name = "media";
const app = await alchemy(name, {
	password: "some2",
});

const FFMPEG = await Container("media-container", {
	className: "FFMPEGContainer",
	instanceType: "basic",
	maxInstances: 50,
	build: {
		context: "./ffmpeg",
	},
});

const worker = await Worker(name, {
	name: `${name}`,
	entrypoint: "./src/index.ts",
	compatibility: "node",
	bindings: {
		FFMPEG: FFMPEG,
	},
	dev: {
		port: 8787,
	},

	compatibilityFlags: ["nodejs_compat"],
	observability: {
		enabled: true,
	},
});

console.log(`Worker deployed at: ${worker.url}`);
await app.finalize();
