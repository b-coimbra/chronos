import Scheduler from './scheduler';

const scheduler = new Scheduler();

scheduler.on('* * * * *', () => {
	console.log('this function executes every minute');
}, {
	verbose: true,
	timezone: 'America/New_York'
});
