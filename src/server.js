#!/usr/bin/env node
const { PORT, CACHE_INTERVAL } = require('./shared/config');
const { serveHTTP } = require('stremio-addon-sdk')
const addonInterface = require('./core/addon')
const Caching = require('./cache')

Caching().then(() => setInterval(() => Caching(), CACHE_INTERVAL))
serveHTTP(addonInterface, { port: PORT, static: '/public' })