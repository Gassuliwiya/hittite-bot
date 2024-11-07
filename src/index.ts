import { BskyAgent } from '@atproto/api';

interface CuneiformData {
	reading: string;
	imageKey: string;
}

interface Env {
	HANDLE: string;
	PASSWORD: string;
	IMAGES: KVNamespace;
}

const cuneiformData: CuneiformData[] = [
	{
		reading: 'a',
		imageKey: 'image-a.png',
	},
	{
		reading: 'aš',
		imageKey: 'image-as.png',
	},
	{
		reading: 'nu',
		imageKey: 'image-nu.png',
	},
];

async function getRandomCuneiform(): Promise<CuneiformData> {
	const randomIndex = Math.floor(Math.random() * cuneiformData.length);
	return cuneiformData[randomIndex];
}

async function postCuneiform(agent: BskyAgent, data: CuneiformData, postTime: string, env: Env) {
	const imageBytes = await env.IMAGES.get(data.imageKey, 'arrayBuffer');
	if (!imageBytes) throw new Error('Image not found');

	const file = new File([imageBytes], data.imageKey, { type: 'image/png' });
	const upload = await agent.uploadBlob(file);

	const postText = `読み方: ${data.reading}`;
	await agent.post({
		text: postText,
		createdAt: postTime,
		embed: {
			$type: 'app.bsky.embed.images',
			images: [{ alt: data.reading, image: upload.data.blob }],
		},
	});
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		const agent = new BskyAgent({ service: 'https://bsky.social' });
		await agent.login({ identifier: env.HANDLE, password: env.PASSWORD });

		const cuneiform = await getRandomCuneiform();
		const postTime = new Date(controller.scheduledTime).toISOString();

		await postCuneiform(agent, cuneiform, postTime, env);
	},
};
