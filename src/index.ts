import { BskyAgent } from '@atproto/api';

interface CuneiformData {
	reading: string;
	imageUrl: string;
}

interface Env {
	HANDLE: string;
	PASSWORD: string;
}

const cuneiformData: CuneiformData[] = [{ reading: 'a', imageUrl: 'https://example.com/a.png' }];

async function getRandomCuneiform(): Promise<CuneiformData> {
	const randomIndex = Math.floor(Math.random() * cuneiformData.length);
	return cuneiformData[randomIndex];
}

async function postCuneiform(agent: BskyAgent, data: CuneiformData, postTime: string) {
	const postText = `読み方: ${data.reading}`;
	await agent.post({
		text: postText,
		createdAt: postTime,
		embed: {
			$type: 'app.bsky.embed.images',
			images: [{ alt: data.reading, image: data.imageUrl }],
		},
	});
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		const agent = new BskyAgent({ service: 'https//bsky.xocial' });
		await agent.login({ identifier: env.HANDLE, password: env.PASSWORD });
		const cuneiform = await getRandomCuneiform();
		const postTime = new Date(controller.scheduledTime).toISOString();

		await postCuneiform(agent, cuneiform, postTime);
	},
};
