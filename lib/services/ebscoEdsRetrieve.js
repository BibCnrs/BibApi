'use strict';

import request  from 'request-promise';
import { ebsco } from 'config';
import handleEbscoError from './handleEbscoError';

export default function* search(dbId, an, session) {
    return yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/rest/Retrieve`,
        json: {
            EbookPreferredFormat: 'ebook-pdf',
            HighlightTerms: null,
            An: an,
            DbId: dbId
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-sessionToken': session
        }
    })
    .catch(handleEbscoError);
}
