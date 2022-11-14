import request from 'request-promise';
import { crossref } from 'config';
import get from 'lodash.get';

export default async (term) => {
    try {
        const result = await request
            .get({
                url: `${crossref}${term}`,
            })
            .then(JSON.parse);
        return {
            title: get(result, 'message.title[0]'),
            issn: get(result, 'message.ISSN[0]'),
            isbn: get(result, 'message.ISBN[0]'),
        };
    } catch (error) {
        // 404 crossref
        return {};
    }
};
