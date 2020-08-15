import { Cron, Options, Schedule, Expr } from './typedefs';
import Logger from './logger';

export default class Timer {
	callback: Function;
	options?: Options;
	timezone: string;

	constructor(callback: Function, options?: Options) {
		this.callback = callback;
		this.options = options;
		this.timezone = this.options?.timezone || 'America/New_York';
	}

	verify(job: Cron): void {
		if (this.options?.verbose)
			Logger.startTime(job, this.timestamp(job));

		setInterval(() => {
			this.compare(job);
		}, 1000);
	}

	get now(): number {
		const now = new Date();
		now.toLocaleString('en-US', { timeZone: this.timezone });
		now.setDate(now.getDate());
		now.setUTCHours(now.getHours() % 12);
		now.setSeconds(0);
		now.setMilliseconds(0);

		return now.getTime();
	}

	private timestamp(job: Cron): number {
		const date = new Date();

		let { hours, minutes, month, dayOfMonth } = job.schedule as Partial<Schedule>;

		// TODO: fix this unholy mess
		hours      = (hours as string).replace('*', '');
		minutes    = (minutes as string).replace('*', '');
		month      = (month as string).replace('*', '');
		dayOfMonth = (dayOfMonth as string).replace('*', '');

		date.toLocaleString('en-US', { timeZone: this.timezone });
		date.setUTCHours(Number(hours), Number(minutes), 0);
		date.setMonth(Number(month) - 1);
		date.setMilliseconds(0);
		date.setSeconds(0);
		date.setDate(Number(dayOfMonth));

		return date.getTime();
	}

	private hasAny({ schedule }: Cron): boolean {
		const values = Object.values(schedule as Schedule);

		return values.includes('*') || values.filter(f => f[0] === '*').length != 0;
	}

	private tick(job: Cron): void {
		const { schedule } = job;

		if (!schedule)
			return;

		const now = new Date();

		// TODO: fix this unholy mess
		if ((schedule?.hours as string).startsWith('*'))
			schedule.hours = '*' + (now.getHours() % 12).toString();

		if ((schedule?.minutes as string).startsWith('*'))
			schedule.minutes = '*' + (now.getMinutes() + 1).toString();

		if ((schedule?.month as string).startsWith('*'))
			schedule.month = '*' + (now.getMonth() + 1).toString();

		if ((schedule?.dayOfMonth as string).startsWith('*'))
			schedule.dayOfMonth = '*' + (now.getDate()).toString();

		job.schedule = schedule;
	}

	private dispatch(job: Cron, timespan: number): void {
		if (job.executed_at === timespan)
			return;

		if (this.options?.verbose)
			Logger.executing(job.id);

		if (this.hasAny(job))
			this.tick(job);

		job.executed_at = timespan;

		this.callback();
	}

	private compare(job: Cron): void {
		if (this.now === this.timestamp(job))
			this.dispatch(job, this.now);
		else
			if (this.hasAny(job))
				this.tick(job);
	}
}
