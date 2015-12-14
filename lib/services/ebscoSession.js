'use strict';

import request from 'request-promise';
import { ebsco } from 'config';

export const getSession = function* (profile) {
    // @TODO remove me once we can access several profile
    if (profile === ebsco.profile.shs) {
        return { SessionToken: 'dummy token'};
    }
    const response = yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/CreateSession`,
        json: {
            Profile: profile
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    return response;
};
