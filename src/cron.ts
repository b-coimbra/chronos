// - `!cron` **〈not impl.〉** — Run commands repeatedly based on some timer (look-up cron syntax for more info):
//   - `!cron [minute] [hour] [day-of-month] [month] [day-of-week] ![command] <...>` — runs a command (with or without arguments) repeatedly as specified by the schedule signature.
//   - `!cron <ls>` — lists all active cron-jobs numerically.
//   - `!cron rm #[job-index]` — removes a cron-job by index.

type Greenwich = 'pm' | 'am';
type Ordinal   = 'st' | 'nd' | 'rd' | 'th';
type AnyValue  = '*';

interface ListValue {
	values: string[];
}

interface RangeValue {
	range: string[];
	step?: string;
}

interface PlaceValue {
	[place: number]: object;
}

type Expr = string
	| RangeValue
	| ListValue
	| AnyValue;

enum Place {
	MINUTE,
	HOUR,
	MONTHDAY,
	MONTH,
	WEEKDAY
}

interface Schedule {
	hours: Expr;
	minutes: Expr;
	dayOfMonth: Expr;
	month: Expr;
	dayOfWeek: Expr;
	greenwich: Greenwich;
	ordinal: Ordinal;
}

type Defaults = keyof Omit<Schedule, 'greenwich' | 'ordinal'>;

interface Command {
	name: string;
	args?: string[];
}

interface Cron {
	id: number;
	schedule?: Partial<Schedule>;
	command?: Command;
	executed_at?: number;
}

type Mapping = Record<string, Function>;

const RESPONSES = {
	help: {
		rm: '.cron rm #[job-index]',
		command: ':warning: There is no command to execute the cron job on.',
		schedule: ':warning: There is no schedule to execute the command on.'
	},
	empty: ":warning: There are no cron jobs being executed."
};

const MATCHERS = {
	hour_mins: '^(((0|1)[0-9])|2[0-3]):[0-5][0-9]\\s?(pm|am)?$',
	day_of_month: '^(?:\\b)(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])(st|nd|rd|th)?)(?:\\b|\\/)$',
	any_value: '^\\*$',
	numerics: '(^(\\d\\.?)+$)',
	range: '(^\\d+\\-\\d+|\\*\\/\\d+)(\\/\\d+)?$',
	list: '^(\\d+\\,\\d+)$',
	weekdays: 'sun mon tue wed thu fri sat'.split(' '),
	prefix: (x: string) => "^\\" + x,
	ordinals: '(st|nd|rd|th)',
	greenwich: '(pm|am)'
};

class Timer {
	constructor() {
	}

	get now(): number {
		const now = new Date();
		now.toLocaleString('en-US', { timeZone: 'America/New_York' });
		now.setDate(now.getDate());
		now.setUTCHours(now.getHours() % 12);
		now.setSeconds(0);
		now.setMilliseconds(0);
		console.log(now);
		return now.getTime();
	}

	timestamp(job: Cron): number {
		const date = new Date();
		const { hours, minutes, month, dayOfMonth } = job.schedule as Partial<Schedule>;

		date.toLocaleString('en-US', { timeZone: 'America/New_York' });
		date.setUTCHours(Number(hours), Number(minutes), 0);
		date.setMonth(Number(month));
		date.setMilliseconds(0);
		date.setSeconds(0);
		date.setDate(Number(dayOfMonth) - 1);

		return date.getTime();
	}

	compare(job: Cron): void {
		if (this.now === this.timestamp(job))
			this.dispatch(job, this.now);
		else
			console.log('SKIPPED', this.now, this.timestamp(job));
	}

	hasAny({ schedule }: Cron): boolean {
		return Object.values(schedule as Schedule).includes('*');
	}
	
	tick(job: Cron): void {
		const { schedule } = job;

		if (!schedule)
			return;

		const now = new Date();

		for (let time in schedule as Record<keyof Schedule, string>) {
			const value = schedule[time as keyof Schedule];

			// if (value === '*')
				// schedule[time] 
		}

		if (schedule?.hours === '*')
			schedule.hours = (now.getHours() + 1).toString();
		else if (schedule?.minutes === '*')
			schedule.minutes = (now.getMinutes() + 1).toString();
		else if (schedule?.month === '*')
			schedule.month = (now.getMonth() + 1).toString();

		job.schedule = schedule;
	}

	dispatch(job: Cron, timespan: number): void {
		if (job.executed_at === timespan)
			return;

		console.log('Executed cron job #', job.id);

		if (this.hasAny(job))
			this.tick(job);
		else
			job.executed_at = timespan;

		//this.homescope.message.content =
		//	`${this.homescope.CONFIG.commands.prefix}${job.command.name} ${job.command.args.join(' ')}`;


		//this.homescope.main.process_command(
		//	this.homescope.message,
		//	true
		//);
	}

	verify(jobs: Cron[]): void {
		jobs.forEach(job => this.compare(job));
	}
}

// let command = `*/4 0,12 1 */2 * .rape @sammy`;
//let command = `21 1 28 5 4 .rape @sammy`;
let command = `01:21am 28th 5 4 .rape @sammy`;
// const command = `0-1/4 4 * * sun .echo pp`;
// const command = '* * * * * .rape @sammy';
// const command = `* * * * * .echo pp`;
// const command = `0-1/4 0,12 1 */2 * .echo pp`;

let crons: Cron[] = [];

const matches = (value: string, regex: string): string | undefined =>
	(value.match(new RegExp(regex)) || {})?.input;

const cleanup = (jobs: Cron[]): Cron[] => jobs
	.filter(x => x != null)
	.map((x, i) => {
		x.id = i;
		return x;
	});

const rm = (job: number) =>
	delete crons[crons.map(cron => cron.id).indexOf(job)];

const list = () => {
	if (crons.length == 0)
		return console.log(RESPONSES.empty);

	console.log('Expression:', command, "\n");
	crons.forEach(f => console.log(f));
}

const tokenize = (args: string[]): Cron => {
	let cron: Cron = {
		id: crons.slice(-1)[0]?.id + 1 || 0
	};

	const add = (schedule: Partial<Schedule>): void => {
		cron.schedule = {
			...cron.schedule,
			...schedule
		};
	};

	const populate = (value: Expr, position: number): void => {
		add(({
			[Place.HOUR]:     { hours:      value },
			[Place.MINUTE]:   { minutes:    value },
			[Place.MONTHDAY]: { dayOfMonth: value },
			[Place.WEEKDAY]:  { dayOfWeek:  value },
			[Place.MONTH]:    { month:      value }
		} as PlaceValue)[position]);
	};

	const set_command = (expr: string, index: number): void => {
		cron.command = {
			name: expr,
			args: args.slice(index + 1)
		};
	};

	const set_hour_mins = (expr: string): void => {
		const [hour, mins] = expr.split(':');
		const [min, greenwich] = mins.split(new RegExp(MATCHERS.greenwich));

		add({
			hours: hour,
			minutes: min,
			greenwich: greenwich as Greenwich
		});
	};

	const set_day_of_month = (expr: string): void => {
		const [dayOfMonth, ordinal] =
			expr.split(new RegExp(MATCHERS.ordinals));

		const date =
			matches(expr, MATCHERS.ordinals) === undefined
			? { month: expr }
			: { dayOfMonth, ordinal: ordinal as Ordinal };

		add(date);
	};

	const set_day_of_week = (expr: string): void => {
		add({
			dayOfWeek: (
				MATCHERS.weekdays.indexOf(expr) + 1
			).toString()
		});
	};

	const set_numerics = (expr: Expr, position: number): void => {
		populate(expr, position);
	};

	const set_any_value = (position: number): void => {
		if (cron.schedule?.hours &&
			cron.schedule?.minutes &&
			cron.schedule?.hours !== '*' &&
			cron.schedule?.minutes !== '*' &&
			cron.schedule?.greenwich) position += 1;

		args[position] = '';
		populate('*', position);
	};

	const set_range = (expr: string, position: number): void => {
		let [from, to, step] = expr.split(/[\-\/]/);
		const values: RangeValue = { range: [from, to] };

		const has_step = (range: string[]) =>
			range[0] == '*' && Number(range[1]) != NaN;

		if (has_step(values.range))
			step = values.range[1];

		if (step) values.step = step;

		populate(values, position);
	};

	const set_list = (expr: string, position: number): void => {
		const values = expr.split(',');
		const list: ListValue = { values };

		populate(list, position);
	};

	const get_defaults = (key: Defaults): string => {
		const now = new Date();

		return {
			hours:      now.getHours(),
			minutes:    now.getMinutes(),
			month:      now.getMonth(),
			dayOfMonth: now.getDate(),
			dayOfWeek:  now.getDay()
		}[key].toString();
	};

	const exec_mappings = (arg: string, mappings: Mapping): void => {
		for (let matcher in mappings)
			if (matches(arg, matcher))
				mappings[matcher]();
	};

	const match_day_of_week = (argument: string): void => {
		argument = argument.toLowerCase();

		if (MATCHERS.weekdays.includes(argument))
			set_day_of_week(argument);
	};

	args.some((argument, i) => {
		let position = args.indexOf(argument);

		const MAPPINGS: Mapping = {
			[MATCHERS.prefix('.')]:  () => set_command(argument, i),
			[MATCHERS.hour_mins]:    () => set_hour_mins(argument),
			[MATCHERS.range]:        () => set_range(argument, position),
			[MATCHERS.list]:         () => set_list(argument, position),
			[MATCHERS.numerics]:     () => set_numerics(argument, position),
			[MATCHERS.day_of_month]: () => set_day_of_month(argument),
			[MATCHERS.any_value]:    () => set_any_value(position)
		};

		exec_mappings(argument, MAPPINGS);
		match_day_of_week(argument);
	});

	Object
		.keys(cron.schedule as object)
		.forEach((value: string) => {
			let key = <Defaults>value;

			if (cron.schedule && cron.schedule[key] == '*')
				cron!.schedule[key] = get_defaults(key);
	});

	return cron;
};

let args = command.split(' ');

if (args[0] === 'ls')
	list();
else if (args[0] === 'rm') {
	let job: number = Number(args[1]);

	(isNaN(job))
		? console.log(RESPONSES.help.rm)
		: rm(job);
}
else {
	const cron: Cron = tokenize(args);

	if (!cron?.command)
		console.log(RESPONSES.help.command);
	else if (!cron?.schedule)
		console.log(RESPONSES.help.schedule)
	else
		crons.push(cron);
}

list();

setInterval(() => {
	new Timer().verify(crons);
}, 2000);
