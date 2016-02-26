import request  from 'request-promise';
import { ebsco } from 'config';
import handleEbscoError from './handleEbscoError';

export default function* ebscoPublicationRetrieve(id, sessionToken, authToken) {
    return yield request.post({
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}`: ''}/edsapi/publication/Retrieve`,
        json: {
            HighlightTerms: null,
            Id: id
        },
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-authenticationToken': authToken,
            'x-sessionToken': sessionToken
        }
    })
    .catch(handleEbscoError);
}
