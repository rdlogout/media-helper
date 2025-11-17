import esbuild from "esbuild";

esbuild
	.build({
		entryPoints: ["./src/index.ts"],
		bundle: true,
		outfile: "./dist/index.js",
		format: "esm", // Required for top-level await and import.meta
		platform: "neutral",
		target: "es2022", // Supports top-level await
		external: ["fastly:*"], // Don't bundle Fastly SDK
		loader: {
			".wasm": "binary", // Imports .wasm files as Uint8Array (inlines bytes into bundle)
		},
		logLevel: "info",
	})
	.catch(() => process.exit(1));
