import { Cron }	from './typedefs';

class Logger {
	constructor () {}

	log(msg: string): void {
		console.log('[chronos]', msg);
	}

	startTime(job: Cron, timestamp: number): void {
		const datetime = new Date(timestamp);

		const [date, time] = [
			datetime.toLocaleDateString('en-US'),
			datetime.toLocaleTimeString('en-US')
		];

		this.log(`Scheduled job ${job.id}: ${date} ${time}`);
	}

	executing(id: number): void {
		this.log('Executing cron job #' + id);
	}
}

export default new Logger();
