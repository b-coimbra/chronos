//class Timer {
//	constructor() {
//	}
//
//	get now(): number {
//		const now = new Date();
//		now.setDate(now.getDate());
//		now.setUTCHours(now.getHours() % 12);
//		now.setSeconds(0);
//		now.setMilliseconds(0);
//		return now.getTime();
//	}
//
//	timestamp(job: Cron): number {
//		const date = new Date();
//		const { hours, minutes, month, dayOfMonth } = job.schedule as Partial<Schedule>;
//
//		//console.log(month);
//		//console.log(hours);
//		//console.log(minutes);
//		//console.log(dayOfMonth);
//
//		date.setUTCHours(Number(hours), Number(minutes), 0);
//		date.setMonth(Number(month) - 1);
//		date.setMilliseconds(0);
//		date.setDate(Number(dayOfMonth));
//
//		return date.getTime();
//	}
//
//	compare(job: Cron): void {
//		if (this.now === this.timestamp(job))
//			this.dispatch(job, this.now);
//		else
//			console.log('SKIPPED', this.now);
//	}
//
//	dispatch(job: Cron, timespan: number) {
//		if (job.executed_at === timespan)
//			return;
//
//		console.log('Executed cron job #', job.id);
//
//		job.executed_at = timespan;
//	}
//
//	verify(jobs: Cron[]): void {
//		jobs.forEach(job => this.compare(job));
//	}
//}
