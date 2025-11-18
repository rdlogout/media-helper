const secret = "GOkhvaFvHlgLDMXOmtD1rgu7aBZC6BTqXafkKIKiDuERvJEI7pM5FRpUif5J5J5n";
const access = "8nRhi4dRfxtlohwwmrhklE";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	region: "us-east-1",
	credentials: {
		accessKeyId: access,
		secretAccessKey: secret,
	},
});

s3.send(
	new GetObjectCommand({
		Key: "vercel-image/xtJA_3kH4Qg.avif",
	})
);
