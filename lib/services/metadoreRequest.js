import request from 'request-promise';
import { metadore_url, metadore_api_key } from 'config';

export default async function metadoreRequest(queryString) {
    const requestData = {
        url: `${metadore_url}/search?${queryString}`,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': metadore_api_key,
        },
    };

    const result = await request.get(requestData);

    return result;
}
