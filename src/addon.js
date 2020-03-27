const { addonBuilder } = require('stremio-addon-sdk');
const manifest = require('./manifest');
const Vice = require('./vice');
const { getLocale, parseId, Parser } = require('./utils');

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
	console.log('Catalog:', type, id, extra)
	
	const { search, genre, skip = 0 } = extra;
	let metas = [];

	if (id === 'search' && search) {
		const vice = new Vice();
		const parser = new Parser();

		if (type === 'channel') {
			let { data } = await vice.searchShows(search, 25);
			metas = data.map(s => parser.showToMeta(s));
		} else if (type === 'videos') {
			let { data } = await vice.searchVideos(search, 25);
			metas = data.map(s => parser.showToMeta(s));
		}
	}

	if (genre) {
		const locale = getLocale(genre);
		const vice = new Vice(locale);
		const parser = new Parser(locale);

		if (id === 'featured' && type === 'channel') {
			if (!skip) metas = global.SHOWS[locale];
			else {
				let { shows } = await vice.getFeaturedShows(35, skip);
				metas = shows.map(s => parser.showToMeta(s));
			}
		} else if (id === 'latest' && type === 'videos') {
			if (!skip) metas = global.VIDEOS[locale];
			else {
				let { videos } = await vice.getLatesVideos(25, skip);
				metas = await Promise.all(videos.map(async v => await parser.videoToMeta(v)));
			}
		}
	}

	return Promise.resolve({ metas });
});

builder.defineMetaHandler(async ({ type, id }) => {
	console.log('Meta:', type, id)

	const { item_id, locale } = parseId(id);
	const vice = new Vice(locale);
	const parser = new Parser(locale);

	let meta = {};
	if (type === 'channel') {
		meta = await parser.showToMeta(await vice.getShow(item_id));
		meta.videos = await Promise.all((await vice.getVideos(item_id)).map(async v => await parser.videoToMeta(v)));
	} else if (type === 'movie') {
		meta = await parser.videoToMeta(await vice.getVideo(item_id));
	}
	
	return Promise.resolve({ meta });
});

builder.defineStreamHandler(async ({ type, id }) => {
	console.log('Streams:', type, id)

	const { item_id, locale } = parseId(id);
	const vice = new Vice(locale);
	const parser = new Parser(locale);

	const stream = await vice.getStream(item_id);
	return Promise.resolve({
		streams: parser.videoToStream(stream, item_id)
	});
});

builder.defineSubtitlesHandler(async ({ type, id }) => {
	console.log('Subtitles:', type, id)

	const { item_id, locale } = parseId(id);
	const vice = new Vice(locale);
	const parser = new Parser(locale);

	const stream = await vice.getStream(item_id);
	return Promise.resolve({
		subtitles: parser.streamToSubs(stream)
	});
});

module.exports = builder.getInterface();