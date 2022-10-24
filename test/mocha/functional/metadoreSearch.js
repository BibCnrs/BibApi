import { spy } from 'chai';
import * as metadoreRequest from '../../../lib/services/metadoreRequest';
import covidResult from '../../mock/controller/covidResult.json';
import parsedCovidResult from '../services/parsedCovidResult.json';

describe('GET /ebsco/metadore/search', function () {
    before(function () {
        spy.on(metadoreRequest, 'default', () =>
            Promise.resolve(JSON.stringify(covidResult)),
        );
    });

    it('should return the parsed response', function* () {
        const response = yield request.get(
            `/ebsco/metadore/search?queries=${encodeURIComponent(
                JSON.stringify([{ term: 'covid' }]),
            )}&resultsPerPage=20`,
        );
        assert.deepEqual(JSON.parse(response.body), parsedCovidResult);
    });
});
