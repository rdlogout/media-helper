import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
const name = "image-proxy";
const app = await alchemy(name);

const worker = await Worker(name, {
	name: `${name}`,
	entrypoint: "./src/index.ts",
	compatibility: "node",
	// No additional rules needed - workerd entry point handles WASM automatically

	compatibilityFlags: ["nodejs_compat"],
	observability: {
		enabled: true,
	},
});

console.log(`Worker deployed at: ${worker.url}`);
await app.finalize();
