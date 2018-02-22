describe('POST /ebsco/domains', function () {
    it('should return all ebsco domains', function* () {
        const domains = ['insb', 'inshs', 'in2p3', 'inc', 'reaxys'];

        yield domains
        .map(name => fixtureLoader.createCommunity({ name, ebsco: name !== 'reaxys' }));

        const response = yield request.get('/ebsco/domains');
        assert.deepEqual(JSON.parse(response.body), ['insb', 'inshs', 'in2p3', 'inc']);
    });


    after(function* () {
        yield fixtureLoader.clear();
    });
});
