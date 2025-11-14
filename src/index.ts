import { Container } from "@cloudflare/containers";
import routes from "./routes";

export class FFMPEGContainer extends Container {
	defaultPort = 3000; // Port the container is listening on
	sleepAfter = "10m"; // Stop the instance if requests not sent for 1 minute
}

// export default class ImageProxy extends WorkerEntrypoint {
// 	fetch(request: Request, env: any) {
// 		return routes.fetch(request, env, this.ctx);
// 	}
// }
// export d
export default routes;
