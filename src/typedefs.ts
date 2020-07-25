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
	| string[]
	| number
	| RangeValue
	| ListValue
	| AnyValue;

interface Schedule {
	hours: Expr;
	minutes: Expr;
	dayOfMonth: Expr;
	month: Expr;
	dayOfWeek: Expr;
	greenwich: Greenwich;
	ordinal: Ordinal;
}

enum Place {
	MINUTE,
	HOUR,
	MONTHDAY,
	MONTH,
	WEEKDAY
}

interface Command {
	name: string;
	args?: string[];
}

type Defaults = keyof Omit<Schedule, 'greenwich' | 'ordinal'>;

type Mapping = Record<string, Function>;

interface Command {
	name: string;
	args?: string[];
}

interface Cron {
	id: number;
	schedule?: Partial<Schedule>;
	callback?: Function;
	running?: boolean;
	executed_at?: number;
}

interface Options {
	verbose?: boolean;
	timezone?: string;
}

interface ListOptions {
	executed?: boolean;
}

export {
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
	Cron,
	Options,
	ListOptions
}
