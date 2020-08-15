import { Cron }	from './typedefs';

import { colorize, Colors } from './colorize';

class Logger {
	constructor () {}

	log(msg: string): void {
		console.log(colorize('[chronos]', Colors.Yellow), msg);
	}

	startTime(job: Cron, timestamp: number): void {
		const datetime = new Date(timestamp);

		const [date, time] = [
			datetime.toLocaleDateString('en-US'),
			datetime.toLocaleTimeString('en-US')
		];

		this.log(
			`Scheduled job ${colorize(job.id.toString(), Colors.Green)}: ${date} ${time}`
		);
	}

	executing(id: number): void {
		this.log('Executing cron job #' + colorize(id.toString(), Colors.Green));
	}
}

export default new Logger();
