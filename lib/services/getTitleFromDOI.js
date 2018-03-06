import request from 'request-promise';
import { crossref } from 'config';
import get from 'lodash.get';

export default async term => {
    try {
        const result = await request.get({
            url: `${crossref}${term}`,
        });
        return get(JSON.parse(result), 'message.title[0]');
    } catch (error) {
        // 404 crossref
        return null;
    }
};
