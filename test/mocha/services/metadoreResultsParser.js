import metadoreResultsParser from '../../../lib/services/metadoreResultsParser';
import covidResult from '../../mock/controller/covidResult.json';

describe('metadoreResultsParser', function () {
    it('should extract relevant information from metadore raw result', function* () {
        assert.deepEqual(
            yield metadoreResultsParser(JSON.stringify(covidResult)),
            require('./parsedCovidResult.json'),
        );
    });
});
