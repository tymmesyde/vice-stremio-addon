const { DOMAIN } = require('./src/shared/config')
const { publishToCentral } = require('stremio-addon-sdk')
publishToCentral(`${DOMAIN}/manifest.json`)