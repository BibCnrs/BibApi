import Community from '../../../lib/models/Community';

describe('model Community', function () {
    let communityQueries;

    before(function () {
        communityQueries = Community(postgres);
    });

    describe('selectByName', function () {
        it('should return each community with given names', function* () {
            const [insb, inshs, , inc] = yield [
                'insb',
                'inshs',
                'in2p3',
                'inc',
            ].map(name => fixtureLoader.createCommunity({ name }));

            assert.deepEqual(
                yield communityQueries.selectByNames(['insb', 'inshs', 'inc']),
                [
                    {
                        ...insb,
                    },
                    {
                        ...inshs,
                    },
                    {
                        ...inc,
                    },
                ],
            );
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectOneByName', function () {
        it('should return community for given name', function* () {
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
            });
            assert.deepEqual(
                yield communityQueries.selectOneByName('inshs'),
                inshs,
            );
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByJanusAccountIdQuery', function () {
        it('should return community of user', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc'].map(
                name =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name,
                    }),
            );
            const john = yield fixtureLoader.createJanusAccount({
                uid: 'john',
                communities: [insb.id, inshs.id],
            });
            const jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(
                yield communityQueries.selectByJanusAccountId(john.id),
                [
                    {
                        ...insb,
                        totalcount: '2',
                        index: 0,
                        janus_account_id: john.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        janus_account_id: john.id,
                    },
                ],
            );
            assert.deepEqual(
                yield communityQueries.selectByJanusAccountId(jane.id),
                [
                    {
                        ...inc,
                        totalcount: '2',
                        index: 0,
                        janus_account_id: jane.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        janus_account_id: jane.id,
                    },
                ],
            );
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return community of inistAccount', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc'].map(
                name =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name,
                    }),
            );
            const john = yield fixtureLoader.createInistAccount({
                username: 'john',
                communities: [insb.id, inshs.id],
            });
            const jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(
                yield communityQueries.selectByInistAccountId(john.id),
                [
                    {
                        ...insb,
                        totalcount: '2',
                        index: 0,
                        inist_account_id: john.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        inist_account_id: john.id,
                    },
                ],
            );
            assert.deepEqual(
                yield communityQueries.selectByInistAccountId(jane.id),
                [
                    {
                        ...inc,
                        totalcount: '2',
                        index: 0,
                        inist_account_id: jane.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        inist_account_id: jane.id,
                    },
                ],
            );
        });
    });

    describe('selectByInstituteIdQuery', function () {
        it('should return community of institute', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc'].map(
                name =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name,
                    }),
            );
            const biology = yield fixtureLoader.createInstitute({
                name: 'biology',
                code: 'insb',
                communities: [insb.id, inshs.id],
            });
            const human = yield fixtureLoader.createInstitute({
                username: 'human science',
                code: 'inshs',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(
                yield communityQueries.selectByInstituteId(biology.id),
                [
                    {
                        ...insb,
                        totalcount: '2',
                        index: 0,
                        institute_id: biology.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        institute_id: biology.id,
                    },
                ],
            );
            assert.deepEqual(
                yield communityQueries.selectByInstituteId(human.id),
                [
                    {
                        ...inc,
                        totalcount: '2',
                        index: 0,
                        institute_id: human.id,
                    },
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 1,
                        institute_id: human.id,
                    },
                ],
            );
        });
    });

    describe('selectByUnitIdQuery', function () {
        it('should return community of unit', function* () {
            const [insb, inshs, inc] = yield ['insb', 'inshs', 'inc'].map(
                name =>
                    fixtureLoader.createCommunity({
                        name,
                        gate: name,
                    }),
            );
            const biology = yield fixtureLoader.createUnit({
                code: 'biology',
                communities: [inshs.id, insb.id],
            });
            const human = yield fixtureLoader.createUnit({
                code: 'human science',
                communities: [inshs.id, inc.id],
            });
            assert.deepEqual(
                yield communityQueries.selectByUnitId(biology.id),
                [
                    {
                        ...inshs,
                        totalcount: '2',
                        index: 0,
                        unit_id: biology.id,
                    },
                    {
                        ...insb,
                        totalcount: '2',
                        index: 1,
                        unit_id: biology.id,
                    },
                ],
            );
            assert.deepEqual(yield communityQueries.selectByUnitId(human.id), [
                {
                    ...inshs,
                    totalcount: '2',
                    index: 0,
                    unit_id: human.id,
                },
                {
                    ...inc,
                    totalcount: '2',
                    index: 1,
                    unit_id: human.id,
                },
            ]);
        });
    });

    afterEach(function* () {
        yield fixtureLoader.clear();
    });
});
