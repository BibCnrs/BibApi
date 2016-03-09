import parseItems from '../../../lib/services/parseItems';

describe('parseItems', function () {

    it('should extract notice data from ebsco record', function* () {
        const items = [
            { Name: 'a', Label: 'label a', Data: 'data for a' },
            { Name: 'b', Label: 'label b', Data: 'data for b' },
            { Name: 'c', Label: 'label c', Data: 'data for c' },
            { SurName: 'd', Label: 'label d', Data: 'data for d' },
            { Name: 'e', Label: 'label e', Datum: 'data for e' }
        ];
        assert.deepEqual(yield parseItems(items), [
            {name: 'a', label: 'label a', value: ['data for a']},
            {name: 'b', label: 'label b', value: ['data for b']},
            {name: 'c', label: 'label c', value: ['data for c']}
        ]);
    });

});
