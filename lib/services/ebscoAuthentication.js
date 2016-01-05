import request from 'request-promise';
import { ebsco } from 'config';

export default function* ebscoAuthentication(userId, password) {
    const response = yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/authservice/rest/UIDAuth`,
        json: {
            UserId: userId,
            Password: password
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    return response;
}
