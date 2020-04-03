#!/usr/bin/env node
const { PORT, CACHE_INTERVAL } = require('../config');
const { serveHTTP, publishToCentral } = require('stremio-addon-sdk')
const addonInterface = require('./addon')
const Caching = require('./cache')

Caching().then(() => setInterval(() => Caching(), CACHE_INTERVAL))
serveHTTP(addonInterface, { port: PORT, static: '/public' })

// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
