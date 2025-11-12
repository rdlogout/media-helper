import { makeRequestToFFmpeg } from "@/lib/ffmpeg";
import { Hono } from "hono";

type Props = {
	file: File;
};
// export const getThumbnail = async (props: Props) => {
// 	const { file } = props;
// 	const formData = new FormData();
// 	formData.append("file", file);
// 	const resp = await makeRequestToFFmpeg("/thumbnail", "POST", formData);
// 	return resp;
// };

export default new Hono()
	.get("/", async (c) => {
		const url = c.req.query("url") || "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
		const file = await fetch(url).then((res) => res.arrayBuffer());
		const start = performance.now();
		const fileObj = new File([file], "video.mp4", { type: "video/mp4" });
		const formData = new FormData();
		formData.append("file", fileObj);
		const resp = await makeRequestToFFmpeg("/thumbnail", "POST", formData);
		return resp;
	})
	.post("/", async (c) => {
		const body = await c.req.formData();

		const formData = new FormData();
		body.forEach((value, key) => {
			formData.append(key, value);
		});
		const resp = await makeRequestToFFmpeg("/thumbnail", "POST", formData);
		return resp;
		// console.log({ info });
	});
