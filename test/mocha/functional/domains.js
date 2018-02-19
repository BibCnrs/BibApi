describe('GET /ebsco/domains', function () {
    it('should return all ebsco domains', function* () {
        const domains = ['insb', 'inshs', 'in2p3', 'inc', 'reaxys'];

        yield domains.map(
            name => fixtureLoader.createCommunity({
                name,
                ebsco: name !== 'reaxys',
                gate: `${name}.bib.cnrs.fr`
            })
        );

        const response = yield request.get('/ebsco/domains');
        assert.deepEqual(JSON.parse(response.body), [
            { name: 'insb', gate: 'insb.bib.cnrs.fr' },
            { name: 'inshs', gate: 'inshs.bib.cnrs.fr' },
            { name: 'in2p3', gate: 'in2p3.bib.cnrs.fr' },
            { name: 'inc', gate: 'inc.bib.cnrs.fr' },
        ]);
    });


    after(function* () {
        yield fixtureLoader.clear();
    });
});
