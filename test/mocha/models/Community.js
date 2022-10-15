import {
    selectByInistAccountId,
    selectByInstituteId,
    selectByJanusAccountId,
    selectByNames,
    selectByUnitId,
    selectOneByName,
} from '../../../lib/models/Community';

describe('model Community', function () {
    describe('selectByName', function () {
        it('should return each community with given names', function* () {
            const insb = yield fixtureLoader.createCommunity({ name: 'insb' });
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
            });
            yield fixtureLoader.createCommunity({
                name: 'in2p3',
            });
            const inc = yield fixtureLoader.createCommunity({ name: 'inc' });

            assert.deepEqual(yield selectByNames(['insb', 'inshs', 'inc']), [
                {
                    ...insb,
                },
                {
                    ...inshs,
                },
                {
                    ...inc,
                },
            ]);
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
            assert.deepEqual(yield selectOneByName('inshs'), inshs);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByJanusAccountIdQuery', function () {
        it('should return community of user', function* () {
            const insb = yield fixtureLoader.createCommunity({
                name: 'insb',
                gate: 'insb',
            });
            const inc = yield fixtureLoader.createCommunity({
                name: 'inc',
                gate: 'inc',
            });
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
                gate: 'inshs',
            });

            const john = yield fixtureLoader.createJanusAccount({
                uid: 'john',
                communities: [insb.id, inshs.id],
            });
            const jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(yield selectByJanusAccountId(john.id), [
                {
                    ...insb,
                    index: 0,
                    janus_account_id: john.id,
                },
                {
                    ...inshs,
                    index: 1,
                    janus_account_id: john.id,
                },
            ]);
            assert.deepEqual(yield selectByJanusAccountId(jane.id), [
                {
                    ...inc,
                    index: 0,
                    janus_account_id: jane.id,
                },
                {
                    ...inshs,
                    index: 1,
                    janus_account_id: jane.id,
                },
            ]);
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return community of inistAccount', function* () {
            const insb = yield fixtureLoader.createCommunity({
                name: 'insb',
                gate: 'insb',
            });
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
                gate: 'inshs',
            });
            const inc = yield fixtureLoader.createCommunity({
                name: 'inc',
                gate: 'inc',
            });

            const john = yield fixtureLoader.createInistAccount({
                username: 'john',
                communities: [insb.id, inshs.id],
            });
            const jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(yield selectByInistAccountId(john.id), [
                {
                    ...insb,

                    index: 0,
                    inist_account_id: john.id,
                },
                {
                    ...inshs,

                    index: 1,
                    inist_account_id: john.id,
                },
            ]);
            assert.deepEqual(yield selectByInistAccountId(jane.id), [
                {
                    ...inshs,

                    index: 0,
                    inist_account_id: jane.id,
                },
                {
                    ...inc,
                    index: 1,
                    inist_account_id: jane.id,
                },
            ]);
        });
    });

    describe('selectByInstituteIdQuery', function () {
        it('should return community of institute', function* () {
            const insb = yield fixtureLoader.createCommunity({
                name: 'insb',
                gate: 'insb',
            });
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
                gate: 'inshs',
            });
            const inc = yield fixtureLoader.createCommunity({
                name: 'inc',
                gate: 'inc',
            });

            const biology = yield fixtureLoader.createInstitute({
                name: 'biology',
                code: 'insb',
                communities: [insb.id, inshs.id],
            });
            const human = yield fixtureLoader.createInstitute({
                name: 'human science',
                code: 'inshs',
                communities: [inc.id, inshs.id],
            });
            assert.deepEqual(yield selectByInstituteId(biology.id), [
                {
                    ...insb,

                    index: 0,
                    institute_id: biology.id,
                },
                {
                    ...inshs,

                    index: 1,
                    institute_id: biology.id,
                },
            ]);
            assert.deepEqual(yield selectByInstituteId(human.id), [
                {
                    ...inshs,
                    index: 0,
                    institute_id: human.id,
                },
                {
                    ...inc,
                    index: 1,
                    institute_id: human.id,
                },
            ]);
        });
    });

    describe('selectByUnitIdQuery', function () {
        it('should return community of unit', function* () {
            const insb = yield fixtureLoader.createCommunity({
                name: 'insb',
                gate: 'insb',
            });
            const inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
                gate: 'inshs',
            });
            const inc = yield fixtureLoader.createCommunity({
                name: 'inc',
                gate: 'inc',
            });

            const biology = yield fixtureLoader.createUnit({
                code: 'biology',
                communities: [inshs.id, insb.id],
            });
            const human = yield fixtureLoader.createUnit({
                code: 'human science',
                communities: [inshs.id, inc.id],
            });
            assert.deepEqual(yield selectByUnitId(biology.id), [
                {
                    ...insb,
                    index: 0,
                    unit_id: biology.id,
                },
                {
                    ...inshs,

                    index: 1,
                    unit_id: biology.id,
                },
            ]);
            assert.deepEqual(yield selectByUnitId(human.id), [
                {
                    ...inshs,
                    index: 0,
                    unit_id: human.id,
                },
                {
                    ...inc,
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
