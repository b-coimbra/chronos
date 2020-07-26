import Parser from './parser';
import Timer  from './timer';

import { Cron, Options, ListOptions } from './typedefs';

class Scheduler {
	private crons: Cron[] = [];

	/**
	 * Creates a new job
	 * @param schedule The schedule itself
	 * @param callback The operation to be executed
	 * @param options  Whether or not to alert when a job is executed
	 */
	on(schedule: string | Cron, callback: Function, options?: Options) {
		let cron: Cron;

		if (this.isCron(schedule))
			cron = schedule;
		else {
			const args = schedule.split(' ');
			cron = new Parser(this.id()).parse(args);
		}

		this.add(cron, callback);
		new Timer(callback, options).verify(cron);
	}

	/**
	 * @param job Job ID to be removed
	 */
	rm(job: number): void {
		delete this.crons[this.crons.map(cron => cron.id).indexOf(job)];
		this.crons = this.clean(this.crons);
	}

	/**
	 * Disables a job in execution
	 * @param job ID of the job to be disabled
	 */
	disable(id: number): void {
		const cron = this.crons.find(f => f.id === id);

		if (cron === undefined)
			return;

		cron.running = false;
	}

	/**
	 * @param options Filter by executed jobs
	 * @returns       List of active jobs filtered by options
	 */
	list(options?: ListOptions): Cron[] {
		if (options?.executed)
			return this.crons.filter(c => c.executed_at);

		return this.crons;
	}

	/**
	 * Manually add a cron object
	 */
	private add(cron: Cron, callback: Function): void {
		cron.callback = callback;
		this.crons.push(cron);
	}

	/**
	 * Generates a new job ID
	 */
	private id(): number {
		return this.crons.slice(-1)[0]?.id + 1 || 0;
	}

	/**
	 * Organizes unordered IDs
	 */
	private clean(jobs: Cron[]): Cron[] {
		return jobs
			.filter(f => f !== null)
			.map((x, i) => {
				x.id = i;
				return x;
			});
	}

	private isCron(schedule: string | Cron): schedule is Cron {
		return (schedule as Cron).schedule !== undefined;
	}
}

export default new Scheduler();
