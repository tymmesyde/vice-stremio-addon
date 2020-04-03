const tape = require('tape')
const client = require('stremio-addon-client')
const { serveHTTP } = require("stremio-addon-sdk")
const Caching = require('../src/cache')
const locales = require('../src/shared/locales.json')
const addonInterface = require('../src/core/addon')

const PORT = 4651

let locale = locales[0]
let addonUrl
let addonServer
let addonClient

Caching(locale.value).then(() => {

    tape('it should serve the addon', (t) => {
        serveHTTP(addonInterface, { port: PORT }).then(h => {
            t.ok(h.url, 'has url')
            t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')
            t.ok(h.server, 'has h.server')

            addonUrl = h.url
            addonServer = h.server

            t.end()
        })
    })

    tape('it should be detected by client', (t) => {
        client.detectFromURL(addonUrl).then(res => {
            t.ok(res, 'has response')
            t.ok(res.addon, 'response has addon')
            t.equal(typeof res.addon, 'object', 'addon is a valid object')

            addonClient = res.addon

            t.end()
        })
    })

    tape('it should not return channels', (t) => {
        addonClient.get('catalog', 'channel', 'nothing', { genre: locale.name }).then(res => {
            t.ok(res, 'has response')
            t.equal(res.metas.length, 0, 'should be empty')
            t.end()
        })
    })

    tape('it should return channels of type channel', (t) => {
        addonClient.get('catalog', 'channel', 'featured', { genre: locale.name }).then(res => {
            t.ok(res, 'has response')
            t.ok(res.metas, 'has metas')
            t.notEqual(res.metas.length, 0, 'should not be empty')
            t.equal(res.metas[0].type, 'channel', `should be a channel`)
            t.end()
        })
    })

    tape('it should not return videos', (t) => {
        addonClient.get('catalog', 'videos', 'nothing', { genre: locale.name }).then(res => {
            t.ok(res, 'has response')
            t.equal(res.metas.length, 0, 'should be empty')
            t.end()
        })
    })

    tape('it should return videos of type movie', (t) => {
        addonClient.get('catalog', 'videos', 'latest', { genre: locale.name }).then(res => {
            t.ok(res, 'has response')
            t.ok(res.metas, 'has metas')
            t.notEqual(res.metas.length, 0, 'should not be empty')
            t.equal(res.metas[0].type, 'movie', `should be a movie`)
            t.end()
        })
    })

    tape.onFinish(() => {
        addonServer.close()
    })

})
