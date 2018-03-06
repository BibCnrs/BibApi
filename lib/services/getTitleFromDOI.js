import request from 'request-promise';
import { crossref } from 'config';
import get from 'lodash.get';

export default async term => {
    const requestData = {
        url: `${crossref}${term}`,
    };

    const result = await request.get(requestData);

    return get(JSON.parse(result), 'message.title[0]');
};
