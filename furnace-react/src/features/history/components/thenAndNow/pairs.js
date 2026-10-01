import furnace1934 from '/src/assets/images/history/furnace-building-1934-b.webp';
import furnaceToday from '/src/assets/images/furnace-top.webp';
import mine1913 from '/src/assets/images/history/cornwall-mine-1913-b.webp';
import pitToday from '/src/assets/images/map/open-pit.webp';
import miners1971 from '/src/assets/images/history/minersvillage-1971.webp';
import minersToday from '/src/assets/images/map/miners-village.webp';
import credits from '../../data/credits';

/*
 * Historic photographs beside the same places today. Set `aligned: true` only when both
 * photographs are taken from the same spot and cropped to the same frame; those pairs get
 * a wipe slider, the rest are shown side by side.
 */
const pairs = [
	{
		id: 'furnace',
		title: 'The furnace building',
		caption: 'The Gothic Revival furnace building in 1934, and today.',
		credit: `${credits.furnace1934} ${credits.today}`,
		then: { src: furnace1934, year: '1934', alt: 'The stone furnace building in 1934' },
		now: { src: furnaceToday, alt: 'The furnace building today, with its brick-topped stack' },
	},
	{
		id: 'pit',
		title: 'The open pit',
		caption: 'Terraced workings of the ore mine in 1913. Since the 1980s the pit has been a lake.',
		credit: `${credits.mine1913} ${credits.today}`,
		then: { src: mine1913, year: '1913', alt: 'The open-pit mine in 1913, terraced slopes of bare rock' },
		now: { src: pitToday, alt: 'The flooded pit today, a lake among trees' },
	},
	{
		id: 'minersvillage',
		title: 'Minersvillage',
		caption: 'Houses built by the mine owners for their workers, in 1971 and today.',
		credit: `${credits.miners1971} ${credits.today}`,
		then: { src: miners1971, year: '1971', alt: 'Stone houses along a street in Minersvillage, 1971' },
		now: { src: minersToday, alt: 'A stone house in Minersvillage in winter today' },
	},
];

export default pairs;
