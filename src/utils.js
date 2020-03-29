const { PREFIX_ID, EXTERNAL_PLAYER } = require('../config');
const crypto = require('crypto');
const request = require('request');
const sharp = require('sharp');
const locales = require('./locales.json');

sha512 = (string) => {
    return crypto.createHash('sha512').update(string).digest('hex');
}

toYear = (timestamp) => {
    return new Date(timestamp).getFullYear();
}

getLocale = (code) => {
    return locales.filter(l => l.name === code)[0].value;
}

parseId = (id) => {
    const res = RegExp(`${PREFIX_ID}(.*):(.*)`, 'g').exec(id);
    return {
        item_id: res[1],
        locale: res[2]
    };
}

parseContributions = (contribs = []) => {
    const links = contribs.map(({ role, contributor }) => {
        const { full_name, urls } = contributor;
        return {
            name: full_name,
            category: role.toLowerCase(),
            url: urls[0]
        };
    });

    return {
        links,
        director: links.filter(({ category }) => category === 'director').map(c => c.name),
        cast: links.filter(({ category }) => category !== 'director').map(c => c.name)
    };
}

parseTopics = (topics = []) => { 
    const genres = topics.filter(({ name }) => name.match(RegExp(/[A-Z]/g))).map(({ name }) => name);
    return {
        genre: genres,
        genres,
        links: genres.map(g => {
            return {
                name: g,
                category: 'genre',
                url: `stremio:///search?search=${g}`
            };
        })
    };
}

makePoster = async ({ thumbnail, logo, size = 250 }) => {
    const ratios = {
        regular: 0.675,
        landscape: 1.77
    };

    const poster = {
        width: Math.round(size * ratios[thumbnail.type]),
        height: size
    };
    
    const thumbnailImage = await getSharpImage(thumbnail.url);
    const logoImage = await getSharpImage(logo.url);

    let logoSize = Math.round(((thumbnail.type === 'regular' ? poster.width : poster.height) / 100) * 80); // Resize logo to 80% of thumbnail width | height
    if (logo.size === 'small') logoSize = Math.round(poster.height / 100) * 20; // Resize logo to 20% of thumbnail height
    logoImage.resize(logoSize);

    const { width, height } = await thumbnailImage.metadata();
    const new_width = Math.round(poster.height * (width / height));
    let position = {};
    if (logo.position.includes('left')) position.left = Math.round((poster.width / 100) * 5);
    if (logo.position.includes('right')) position.left = Math.round(((poster.width / 100) * 95) - logoSize);
    if (logo.position.includes('top')) position.top = Math.round((poster.width / 100) * 5);
    if (logo.position.includes('bottom') && logo.position.includes('left')) position.top = Math.round(poster.height - position.left - logoSize);
    if (logo.position.includes('bottom') && logo.position.includes('right')) position.top = Math.round(poster.height - (poster.width - position.left));
    
    let buffer = null;
    try {
        buffer = await thumbnailImage
                            .resize(new_width)
                            .extract({ left: Math.round((new_width - poster.width) / 2), top: 0, width: poster.width, height: poster.height })
                            .composite([{ input: await logoImage.toBuffer(), ...position, gravity: 'center' }])
                            .jpeg()
                            .toBuffer();
    } catch (e) {
        buffer = thumbnailImage.toBuffer();
    }

    return Promise.resolve(`data:image/jpeg;base64,${buffer.toString('base64')}`);
}

getSharpImage = (url) => {
    return new Promise(resolve => request(url, { encoding: null }, (req, res, body) => resolve(sharp(body))));
}

class Parser {
    constructor(locale = 'en_us') {
        this.locale = locale;
    }

    showToMeta({ id, title, dek, url, lede, channel, logo, thumbnail_url, topics }) {
        const { social_lede, thumbnail_url: channel_thumbnail, light_logo_url: channel_logo } = channel;

        const meta = {
            type: 'channel',
            id: `${PREFIX_ID}${id}:${this.locale}`,
            name: title,
            description: dek,
            website: url,
            posterShape: 'regular',
            poster: thumbnail_url ? thumbnail_url : social_lede ? social_lede.thumbnail_url : '',
            background: lede ? lede.thumbnail_url : channel ? channel_thumbnail : '',
            logo: logo ? logo.thumbnail_url : channel ? channel_logo : '',
            available: true
        };

        return {
            ...meta,
            ...parseTopics(topics)
        };
    }

    async videoToMeta({ vms_id, title, summary, thumbnail_url, channel, publish_date, episode, contributions, topics }) {
        const { episode_number, season } = episode;
        const { badge_url } = channel;
        const id = `${PREFIX_ID}${vms_id}:${this.locale}`;
        
        const meta = {
            type: 'movie',
            id,
            name: title,
            overview: summary,
            description: summary,
            episode: episode_number,
            season: season.season_number,
            releaseInfo: toYear(publish_date),
            released: new Date(publish_date),
            posterShape: 'landscape',
            poster: await makePoster({
                thumbnail: {
                    url: thumbnail_url,
                    type: 'landscape'
                },
                logo: {
                    url: badge_url,
                    size: 'small',
                    position: 'top-left'
                }
            }),
            background: thumbnail_url,
            thumbnail: thumbnail_url || '',
            available: true,
            behaviorHints: {
                defaultVideoId: id
            }
        };

        const contribs = parseContributions(contributions);
        const tops = parseTopics(topics);
 
        return {
            ...meta,
            ...contribs,
            ...tops,
            links: [
                ...contribs.links,
                ...tops.links
            ]
        };
    }

    videoToStream({ err, details, playURL, videoMetadata }, item_id = '') {
        const streams = [];

        if (err)
            streams.push({
                title: `🔗 External\n❌ ${details}`,
                externalUrl: `${EXTERNAL_PLAYER}/${this.locale}/embed/${item_id}`
            });

        if(videoMetadata) {
            const { urls } = videoMetadata;

            if (urls.length)
                streams.push({
                    title: '🔗 External',
                    externalUrl: urls[0]
                });
            
            streams.push({
                title: '▶ 1080p / 720p / 480p',
                url: playURL
            });
        }

        return streams;
    }

    streamToSubs({ subtitleURLs }) {
        return subtitleURLs.map(({ languages, url }) => {
            return {
                lang: languages[0].name,
                url: url
            }
        });
    }
}

module.exports = { sha512, getLocale, parseId, Parser };