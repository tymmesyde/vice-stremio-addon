const { SHOWS_LIMIT, VIDEOS_LIMIT } = require('../config');
const Bluebird = require('bluebird');
const locales = require('./locales.json');
const Vice = require('./vice');
const { Parser } = require('./utils');

global.SHOWS = {};
global.VIDEOS = {};

module.exports = locale => {
    return Bluebird.each(locale ? [locales.find(({ value }) => value === locale)] : locales, async ({ name, value }) => {
        console.log(`Caching ${name} (${value}) ...`);

        const vice = new Vice(value);
        const parser = new Parser(value);

        try {
            const { shows } = await vice.getFeaturedShows(parseInt(SHOWS_LIMIT));
            global.SHOWS[value] = shows.map(s => parser.showToMeta(s));

            const { videos } = await vice.getLatesVideos(parseInt(VIDEOS_LIMIT));
            global.VIDEOS[value] = await Promise.all(videos.map(async v => await parser.videoToMeta(v)));
        } catch (e) {
            console.log(`Error while caching ${name} (${value}): ${e}`);
        }
    });
};