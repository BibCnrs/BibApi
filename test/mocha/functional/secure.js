import RenaterHeader from '../../../lib/models/RenaterHeader';

describe('GET /secure', function () {

    it('should save all received header as a new renaterHeader', function* () {
        const headers = { cn: 'doe', displayname: 'john', mail: 'john@doe.fr', what: 'ever'};
        const result = yield (request.get('/secure', null, headers));
        assert.deepEqual(result, 'Merci de vous être loggé');

        const renaterHeaders = yield RenaterHeader.find();

        assert.equal(renaterHeaders.length, 1);

        const renaterHeader = renaterHeaders[0].toJSON();

        assert.equal(renaterHeader.cn, headers.cn);
        assert.equal(renaterHeader.displayname, headers.displayname);
        assert.equal(renaterHeader.main, headers.main);
        assert.equal(renaterHeader.what, headers.what);
    });

    after(function* () {
        yield fixtureLoader.clear();
    });
});
