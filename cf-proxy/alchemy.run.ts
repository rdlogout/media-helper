import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
const name = "media";
const app = await alchemy(name, {
	password: "some2",
});

const worker = await Worker(name, {
	name: `${name}`,
	entrypoint: "./src/index.ts",
	compatibility: "node",
	bindings: {
		// IMAGES,
	},
	dev: {
		port: 8787,
	},
	url: true,

	compatibilityFlags: ["nodejs_compat"],
	observability: {
		enabled: true,
	},
});
export { worker };
console.log(`Worker URL: ${worker.url}`);

await app.finalize();
