export enum Colors {
	Reset  = 0,
	Red    = 31,
	Green  = 32,
	Yellow = 33,
	Blue   = 34,
};

export const colorize = (str: string, color: Colors, bg = false): string =>
	`\x1b[${bg ? color + 10 : color}m${str}\x1b[0m`;
