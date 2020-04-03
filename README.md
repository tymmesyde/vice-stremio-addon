<img src="https://raw.githubusercontent.com/tymmesyde/vice-stremio-addon/master/public/background.png" width="600">

# Vice: Stremio Addon

## Configuration

Edit `./config.js`

```js
{
    PORT: 8080,
    DOMAIN: "http://localhost:8080",
    EXTERNAL_PLAYER: "https://video.vice.com",
    API_ENDPOINT: "https://video.vice.com/api/v1",
    PLAYER_ENDPOINT: "https://vms.vice.com/en_us/video/preplay",
    ADDON_NAME: "Vice",
    PREFIX_ID: "vice:",
    SHOWS_LIMIT: 35,
    VIDEOS_LIMIT: 25,
    CACHE_INTERVAL: 3600000
}
```
