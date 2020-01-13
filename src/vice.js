require('dotenv').config();
const { API_ENDPOINT, PLAYER_ENDPOINT } = process.env;
const request = require('request');
const requestGraphQL = require('graphql-request').request;
const querystring = require('querystring');
const { sha512 } = require('./utils');

class Vice {
    constructor(locale = 'en_us') {
        this.locale = locale;
    }

    _request(url) {
        return new Promise(resolve => request(url, (req, res, body) => {
            try {
                resolve(JSON.parse(body));
            } catch(e) {
                resolve([]);
            }
        }));
    }

    _requestGraphQL(url, query, variables) {
        return requestGraphQL(url, query, variables);
    }

    _get(id, type) {
        return this._request(`${API_ENDPOINT}/${type}/${id}?locale=${this.locale}`);
    }

    _search(query, type, limit = 25) {
        return this._request(`${API_ENDPOINT}/search?locale=${this.locale}&q=${query}&per_page=${limit}&model=${type}`);
    }

    searchShows(query, limit) {
        return this._search(query, 'shows', limit);
    }

    searchVideos(query, limit) {
        return this._search(query, 'videos', limit);
    }

    getShow(id) {
        return this._get(id, 'shows');
    }

    getVideo(id) {
        return this._get(id, 'videos');
    }

    async getLatesVideos(limit, skip = 0) {
        const variables = {
            locale: this.locale,
            page: (skip / limit) + 1,
            per_page: limit
        };

        const query = `
            query VideoHomePage($locale: String!, $page: Int!, $per_page: Int!) {
                videos(locale: $locale, page: $page, per_page: $per_page) {
                    id
                    vms_id
                    title
                    summary
                    thumbnail_url
                    publish_date
                    episode {
                        episode_number
                        season {
                            season_number
                        }
                    }
                    channel {
                        badge_url
                    }
                    contributions{
                        role,
                        contributor {
                            full_name
                            urls
                        }
                    }
                    topics {
                        name
                    }
                }
            }
        `;
        
        return this._requestGraphQL(`${API_ENDPOINT}/graphql`, query, variables);
    }

    getFeaturedShows(limit, skip = 0) {
        const variables = {
            locale: this.locale,
            page: (skip / limit) + 1,
            per_page: limit,
            topic_id: '57a204be8cb727dec79528cb' // Featured
        };

        const query = `
            query VideoHomePage($locale: String!, $page: Float!, $per_page: Float!, $topic_id: ID!) {
                shows(locale: $locale, page: $page, per_page: $per_page, topic_id: $topic_id) {
                    id
                    title
                    dek
                    url
                    lede {
                        thumbnail_url
                    }
                    channel {
                        thumbnail_url
                        light_logo_url
                        social_lede {
                            thumbnail_url
                        }
                    }
                    logo {
                        thumbnail_url
                    }
                    thumbnail_url
                }
            }
        `;
        
        return this._requestGraphQL(`${API_ENDPOINT}/graphql`, query, variables);
    }

    getVideos(show_id) {
        const params = {
            locale: this.locale,
            show_id,
            video_type: 'full_length',
            sort: 'episode_display_mode',
            per_page: 25,
            page: 1
        };

        return this._request(`${API_ENDPOINT}/videos?${querystring.stringify(params)}`);
    }

    getStream(id) {
        const expires = parseInt(Date.now() / 1e3, 10) + 1440;
        const params = {
            skipadstitching: 1,
            _ad_unit: '',
            _aid: '',
            _debug: 0,
            exp: expires,
            fbprebidtoken: '',
            platform: 'desktop',
            rn: Math.floor(9e4 * Math.random()) + 1e4,
            sign: sha512(`${id}:GET:${expires}`),
            tvetoken: '',
            mvpd: ''
        };

        return this._request(`${PLAYER_ENDPOINT}/${id}?${querystring.stringify(params)}`);
    }
}

module.exports = Vice;