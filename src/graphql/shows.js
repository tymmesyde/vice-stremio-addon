module.exports = `
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