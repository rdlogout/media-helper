const makeReq = async () => {
	try {
		const res = await fetch("https://m1.fussion.studio/");
		// const data = await res.json();
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

let startTime = Date.now();
let endTime = 0;
let latency = 0;
let count = 0;
let totalLatency = 0;

while (true) {
	startTime = Date.now();
	const res = await makeReq();
	if (res) {
		count++;
		endTime = Date.now();
		latency = endTime - startTime;
		totalLatency += latency;
		console.log(`Success in ${latency}ms, Average Latency: ${(totalLatency / count).toFixed(2)}ms`);
	}
}
