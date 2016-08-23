import request from 'request-promise';
import { ebsco } from 'config';

export default function* ebscoSession(profile, token) {
    const response = yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/CreateSession`,
        json: {
            Profile: profile,
            Guest: 'n'
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-authenticationToken': token
        }
    });

    return response;
}
