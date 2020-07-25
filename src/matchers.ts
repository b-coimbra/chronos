const MATCHERS: Record<string, any> = {
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

export {
	MATCHERS
};
