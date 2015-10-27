'use strict';

import request from 'request-promise';
import { ebsco } from 'config';

export const getSession = function* (profile) {
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
