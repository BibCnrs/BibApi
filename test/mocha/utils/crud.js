import { getListParams } from '../../../lib/utils/crud';

describe('crud getListParams', function () {

    it('should default last and first to 30 and 0', function () {
        assert.deepEqual(getListParams({}), {
            filter: {},
            first: 0,
            last: 30,
            sortField: '_id',
            sortDir: 'asc'
        });

        assert.deepEqual(getListParams({
            _page: 1,
            _perPage: 10
        }), {
            filter: {},
            first: 0,
            last: 10,
            sortField: '_id',
            sortDir: 'asc'
        });

        assert.deepEqual(getListParams({
            _page: 2,
            _perPage: 15
        }), {
            filter: {},
            first: 15,
            last: 30,
            sortField: '_id',
            sortDir: 'asc'
        });
    });

    it('should compute first and last from received _page and _perPage', function () {
        assert.deepEqual(getListParams({
            _page: 2,
            _perPage: 10
        }), {
            filter: {},
            first: 10,
            last: 20,
            sortField: '_id',
            sortDir: 'asc'
        });

        assert.deepEqual(getListParams({
            _page: 1,
            _perPage: 10
        }), {
            filter: {},
            first: 0,
            last: 10,
            sortField: '_id',
            sortDir: 'asc'
        });

        assert.deepEqual(getListParams({
            _page: 2,
            _perPage: 15
        }), {
            filter: {},
            first: 15,
            last: 30,
            sortField: '_id',
            sortDir: 'asc'
        });
    });
});
