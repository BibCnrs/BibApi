import request from 'request-promise';
import { doaj_url } from 'config';
import get from 'lodash.get';

export default async (isn) => {
    try {
        const result = await request
            .get({
                url: `${doaj_url}search/journals/issn:${isn}`,
            })
            .then(JSON.parse);
        return {
            has_apc: get(result, 'results[0].bibjson.apc.has_apc', null),
        };
    } catch (error) {
        // 404 crossref
        return {};
    }
};
