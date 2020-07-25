import {
	Greenwich,
	Ordinal,
	AnyValue,
	ListValue,
	RangeValue,
	PlaceValue,
	Expr,
	Schedule,
	Place,
	Defaults,
	Mapping,
	Command,
	Cron
} from './typedefs';

import { MATCHERS } from './matchers';

export default class Parser {
	cron: Cron;

	constructor(id: number) {
		this.cron = { id };
	}

	parse(args: string[]): Cron {
		args.some((argument, i) => {
			let position = args.indexOf(argument);

			const MAPPINGS: Mapping = {
				[MATCHERS.hour_mins]:    () => this.setHourMins(argument),
				[MATCHERS.range]:        () => this.setRange(argument, position),
				[MATCHERS.list]:         () => this.setList(argument, position),
				[MATCHERS.numerics]:     () => this.setNumerics(argument, position),
				[MATCHERS.day_of_month]: () => this.setDayOfMonth(argument),
				[MATCHERS.any_value]:    () => this.setAnyValue(position)
			};

			args[position] = '';

			this.execMappings(argument, MAPPINGS);
			this.matchDayOfWeek(argument);
		});

		// this.setDefaults();

		return this.cron;
	}

	private matches(value: string, regex: string): string | undefined {
		return (value.match(new RegExp(regex)) || {})?.input;
	}

	private execMappings(arg: string, mappings: Mapping): void {
		for (let matcher in mappings)
			if (this.matches(arg, matcher))
				mappings[matcher]();
	};

	private add(schedule: Partial<Schedule>): void {
		this.cron.schedule = {
			...this.cron.schedule,
			...schedule
		};
	}

	private populate(value: Expr, position: number): void {
		this.add(({
			[Place.HOUR]:     { hours:      value },
			[Place.MINUTE]:   { minutes:    value },
			[Place.MONTHDAY]: { dayOfMonth: value },
			[Place.WEEKDAY]:  { dayOfWeek:  value },
			[Place.MONTH]:    { month:      value }
		} as PlaceValue)[position]);
	}

	private setHourMins(expr: string): void {
		const [hour, mins] = expr.split(':');
		const [min, greenwich] = mins.split(new RegExp(MATCHERS.greenwich));

		this.add({
			hours: hour,
			minutes: min,
			greenwich: greenwich as Greenwich
		});
	};

	private setDayOfMonth(expr: string): void {
		const [dayOfMonth, ordinal] =
			expr.split(new RegExp(MATCHERS.ordinals));

		const date =
			this.matches(expr, MATCHERS.ordinals) === undefined
			? { month: expr }
			: { dayOfMonth, ordinal: ordinal as Ordinal };

		this.add(date);
	}

	private setDayOfWeek(expr: string): void {
		this.add({
			dayOfWeek: (
				MATCHERS.weekdays.indexOf(expr) + 1
			).toString()
		});
	};

	private setNumerics(expr: Expr, position: number): void {
		this.populate(expr, position);
	}

	private setAnyValue(position: number): void {
		if (this.cron.schedule?.hours &&
			this.cron.schedule?.minutes &&
			this.cron.schedule?.hours !== '*' &&
			this.cron.schedule?.minutes !== '*' &&
			this.cron.schedule?.greenwich)
			position += 1;

		this.populate('*', position);
	};

	private setRange(expr: string, position: number): void {
		let [from, to, step] = expr.split(/[\-\/]/);
		const values: RangeValue = { range: [from, to] };

		const has_step = (range: string[]) =>
			range[0] == '*' && Number(range[1]) != NaN;

		if (has_step(values.range))
			step = values.range[1];

		if (step) values.step = step;

		this.populate(values, position);
	}

	private setList(expr: string, position: number): void {
		const values = expr.split(',');
		const list: ListValue = { values };

		this.populate(list, position);
	}

	private getDefaults(key: Defaults): string {
		const now = new Date();

		return {
			hours:      now.getHours(),
			minutes:    now.getMinutes(),
			month:      now.getMonth(),
			dayOfMonth: now.getDate(),
			dayOfWeek:  now.getDay()
		}[key].toString();
	}

	private setDefaults(): void {
		Object
			.keys(this.cron.schedule as object)
			.forEach((value: string) => {
				let key = <Defaults>value;

				if (this.cron.schedule && this.cron.schedule[key] === '*')
					this.cron!.schedule[key] = this.getDefaults(key);
			});
	}

	private matchDayOfWeek(argument: string): void {
		argument = argument.toLowerCase();

		if (MATCHERS.weekdays.includes(argument))
			this.setDayOfWeek(argument);
	};
}
