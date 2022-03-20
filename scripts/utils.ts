import { execa } from 'execa';

export const IMG_NAME_PREFIX = 'cstar-';

export function now() {
	var hrTime = process.hrtime();
	return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

// #region    --- Kubectl Utilities
export async function getPodName(serviceName: String): Promise<string> {
	const podNameArgs = ['get', 'pods', '-l', `run=${IMG_NAME_PREFIX}${serviceName}`, '--no-headers=true', '-o', 'custom-columns=:metadata.name'];

	try {
		const podName = (await execa('kubectl', podNameArgs)).stdout?.trim();
		return podName;
	} catch (ex: any) {
		throw new Error(`ERROR - Pod not found for service name ${serviceName}`)
	}
}
// #endregion --- Kubectl Utilities

export async function prompt(message: string): Promise<string> {
	// console.log(`\n${message}: `);
	process.stdout.write(`${message}`);
	return new Promise(function (resolve, reject) {
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (text: Buffer) {
			process.stdin.pause();
			resolve(text.toString().trim());
		});
	});
}


