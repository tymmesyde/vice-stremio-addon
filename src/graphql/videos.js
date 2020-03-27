module.exports = `
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
            contributions {
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