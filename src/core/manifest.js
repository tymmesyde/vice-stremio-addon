const { DOMAIN, ADDON_NAME, PREFIX_ID } = require('../shared/config');
const { description, version } = require('../../package.json');
const locales = require('../shared/locales.json');

module.exports = {
    id: 'community.vice',
    name: ADDON_NAME,
    description,
    logo: `${DOMAIN}/public/logo.png`,
    background: `${DOMAIN}/public/background.png`,
    version,
    idPrefixes: [PREFIX_ID],
    resources: [
        'catalog',
        'stream',
        'meta',
        'subtitles'
    ],
    types: [
        'channel',
        'movie',
    ],
    catalogs: [
        {
            type: 'channel',
            id: 'search',
            name: 'Search',
            extraSupported: ['search'],
            extraRequired: ['search']
        },
        {
            type: 'videos',
            id: 'search',
            name: 'Search',
            extraSupported: ['search'],
            extraRequired: ['search']
        },
        {
            type: 'channel',
            id: 'featured',
            name: ADDON_NAME,
            genres: locales.map(l => l.name),
            extraSupported: ['genre', 'skip'],
            extraRequired: ['genre'],
            extra: [
                {
                    name: 'genre',
                    options: locales.map(l => l.name),
                    isRequired: true
                },
                {
                    name: 'skip'
                }
            ]
        },
        {
            type: 'videos',
            id: 'latest',
            name: ADDON_NAME,
            genres: locales.map(l => l.name),
            extraSupported: ['genre', 'skip'],
            extraRequired: ['genre'],
            extra: [
                {
                    name: 'genre',
                    options: locales.map(l => l.name),
                    isRequired: true
                },
                {
                    name: 'skip'
                }
            ]
        },
    ]
};