describe('GET /ebsco/domains', function () {
    it('should return all ebsco domains', function* () {
        yield fixtureLoader.createCommunity({
            name: 'insb',
            gate: 'insb.bib.cnrs.fr',
        });
        yield fixtureLoader.createCommunity({
            name: 'inshs',
            gate: 'inshs.bib.cnrs.fr',
        });
        yield fixtureLoader.createCommunity({
            name: 'in2p3',
            gate: 'in2p3.bib.cnrs.fr',
        });
        yield fixtureLoader.createCommunity({
            name: 'inc',
            gate: 'inc.bib.cnrs.fr',
        });
        yield fixtureLoader.createCommunity({
            name: 'reaxys',
            gate: 'reaxys',
            ebsco: false,
        });
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
