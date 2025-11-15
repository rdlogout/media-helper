import alchemy from "alchemy";
import { Images, Worker } from "alchemy/cloudflare";
const name = "media";
const app = await alchemy(name, {
	password: "some2",
});

const IMAGES = await Images({ dev: { remote: true } });

const worker = await Worker(name, {
	name: `${name}`,
	entrypoint: "./src/index.ts",
	compatibility: "node",
	bindings: {
		IMAGES,
	},
	dev: {
		port: 8787,
	},

	compatibilityFlags: ["nodejs_compat"],
	observability: {
		enabled: true,
	},
});

await app.finalize();
