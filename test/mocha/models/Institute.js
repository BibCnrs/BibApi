import {
    getInstitutes,
    insertOne,
    selectByIds,
    selectByInistAccountId,
    selectByJanusAccountId,
    selectByUnitId,
    selectOne,
    updateOne,
    upsertOnePerCode,
} from '../../../lib/models/Institute';
import prisma from '../../../lib/prisma/prisma';

describe('model Institute', function () {
    describe('selectOne', function () {
        let institute, vie, shs;

        before(function* () {
            vie = yield fixtureLoader.createCommunity({
                name: 'vie',
                gate: 'insb',
            });
            shs = yield fixtureLoader.createCommunity({
                name: 'shs',
                gate: 'inshs',
            });
            yield fixtureLoader.createCommunity({
                name: 'nuclear',
                gate: 'in2p3',
            });
            yield fixtureLoader.createCommunity({
                name: 'universe',
                gate: 'insu',
            });

            institute = yield fixtureLoader.createInstitute({
                name: 'biology',
                code: 'insb',
                communities: [vie.id, shs.id],
            });
        });

        it('should return one institute by id', function* () {
            assert.deepEqual(yield selectOne(institute.id), {
                id: institute.id,
                name: 'biology',
                code: 'insb',
                communities: [vie.id, shs.id],
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectPage', function () {
        let biology, chemestry, humanity, vie, shs, universe, nuclear;
        before(function* () {
            vie = yield fixtureLoader.createCommunity({
                name: 'vie',
                gate: 'insb',
            });
            shs = yield fixtureLoader.createCommunity({
                name: 'shs',
                gate: 'inshs',
            });
            universe = yield fixtureLoader.createCommunity({
                name: 'universe',
                gate: 'insu',
            });
            nuclear = yield fixtureLoader.createCommunity({
                name: 'nuclear',
                gate: 'in2p3',
            });
            chemestry = yield fixtureLoader.createInstitute({
                name: 'chemestry',
                code: '52',
                communities: [vie.id, shs.id],
            });
            biology = yield fixtureLoader.createInstitute({
                name: 'biology',
                code: '53',
                communities: [vie.id, nuclear.id],
            });
            humanity = yield fixtureLoader.createInstitute({
                name: 'humanity',
                code: '54',
                communities: [universe.id, nuclear.id],
            });
        });

        it('should return one institute by id', function* () {
            assert.deepEqual(yield getInstitutes(), [
                {
                    id: chemestry.id,
                    name: 'chemestry',
                    code: '52',
                    communities: [vie.id, shs.id],
                },
                {
                    id: biology.id,
                    name: 'biology',
                    code: '53',
                    communities: [vie.id, nuclear.id],
                },
                {
                    id: humanity.id,
                    name: 'humanity',
                    code: '54',
                    communities: [universe.id, nuclear.id],
                },
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateOne', function () {
        let institute, insb, inc, inshs;

        beforeEach(function* () {
            insb = yield fixtureLoader.createCommunity({
                name: 'insb',
                gate: 'insb',
            });
            inc = yield fixtureLoader.createCommunity({
                name: 'inc',
                gate: 'inc',
            });
            inshs = yield fixtureLoader.createCommunity({
                name: 'inshs',
                gate: 'inshs',
            });

            institute = yield fixtureLoader.createInstitute({
                name: 'biology',
                communities: [insb.id, inc.id],
            });
        });

        it('should throw an error if trying to add a community which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateOne(institute.id, {
                    communities: [404, inshs.id],
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Communities 404 does not exists');

            const instituteCommunities =
                yield prisma.institute_community.findMany({
                    where: {
                        institute_id: institute.id,
                    },
                });
            assert.deepEqual(instituteCommunities, [
                {
                    institute_id: institute.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    institute_id: institute.id,
                    community_id: inc.id,
                    index: 1,
                },
            ]);
        });

        it('should add given new community', function* () {
            yield updateOne(institute.id, {
                communities: [insb.id, inc.id, inshs.id],
            });

            const instituteCommunities =
                yield prisma.institute_community.findMany({
                    where: {
                        institute_id: institute.id,
                    },
                });
            assert.deepEqual(instituteCommunities, [
                {
                    institute_id: institute.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    institute_id: institute.id,
                    community_id: inc.id,
                    index: 1,
                },
                {
                    institute_id: institute.id,
                    community_id: inshs.id,
                    index: 2,
                },
            ]);
        });

        it('should remove missing community', function* () {
            yield updateOne(institute.id, {
                communities: [insb.id],
            });

            const instituteCommunities =
                yield prisma.institute_community.findMany({
                    where: {
                        institute_id: institute.id,
                    },
                });
            assert.deepEqual(instituteCommunities, [
                {
                    institute_id: institute.id,
                    community_id: insb.id,
                    index: 0,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('insertOne', function () {
        let insb, inc;

        beforeEach(function* () {
            insb = yield fixtureLoader.createCommunity({
                name: 'insb',
            });
            inc = yield fixtureLoader.createCommunity({
                name: 'inc',
            });
        });

        it('should add given communities if they exists', function* () {
            const institute = yield insertOne({
                name: 'biology',
                code: '53',
                communities: [inc.id, insb.id],
            });

            const instituteCommunities =
                yield prisma.institute_community.findMany({
                    where: {
                        institute_id: institute.id,
                    },
                    orderBy: {
                        index: 'asc',
                    },
                });
            assert.deepEqual(instituteCommunities, [
                {
                    institute_id: institute.id,
                    community_id: insb.id,
                    index: 0,
                },
                {
                    institute_id: institute.id,
                    community_id: inc.id,
                    index: 1,
                },
            ]);
        });

        it('should throw an error if trying to insert an institute with community that do not exists', function* () {
            let error;
            try {
                yield insertOne({
                    name: 'biology',
                    code: '53',
                    communities: [insb.id, 404],
                });
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Communities 404 does not exists');
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('upsertOnePerCode', function () {
        it('should create a new institute if none exists with the same code', function* () {
            const institute = yield upsertOnePerCode({
                name: 'biology',
                code: '53',
            });

            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                code: '53',
            });

            const insertedInstitute = yield prisma.institute.findFirst({
                where: {
                    name: 'biology',
                },
            });

            assert.deepEqual(insertedInstitute, institute);
        });

        it('should update existing institute with the same code', function* () {
            const previousInstitute = yield fixtureLoader.createInstitute({
                name: 'bilogy',
                code: '53',
            });
            const institute = yield upsertOnePerCode({
                name: 'biology',
                code: '53',
            });
            assert.deepEqual(institute, {
                id: institute.id,
                name: 'biology',
                code: '53',
            });

            const updatedInstitute = yield prisma.institute.findUnique({
                where: {
                    id: previousInstitute.id,
                },
            });

            assert.deepEqual(updatedInstitute, institute);
            assert.notDeepEqual(updatedInstitute, previousInstitute);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByIds', function () {
        let institute53, institute54;

        before(function* () {
            institute53 = yield fixtureLoader.createInstitute({
                code: '53',
                name: 'Institute 53',
            });
            institute54 = yield fixtureLoader.createInstitute({
                code: '54',
                name: 'Institute 54',
            });
        });

        it('should return each institutes with given ids', function* () {
            assert.deepEqual(
                yield selectByIds([institute53.id, institute54.id]),
                [
                    {
                        id: institute53.id,
                        name: institute53.name,
                        code: institute53.code,
                    },
                    {
                        id: institute54.id,
                        name: institute54.name,
                        code: institute54.code,
                    },
                ],
            );
        });

        it('should throw an error if trying to retrieve an institute that does not exists', function* () {
            let error;

            try {
                yield selectByIds([institute53.id, institute54.id, 404]);
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'Institutes 404 does not exists');
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByJanusAccountIdQuery', function () {
        it('should return additional_institute of user', function* () {
            const institute53 = yield fixtureLoader.createInstitute({
                code: '53',
                name: `Institute 53`,
            });
            const institute54 = yield fixtureLoader.createInstitute({
                code: '54',
                name: `Institute 54`,
            });
            const institute55 = yield fixtureLoader.createInstitute({
                code: '55',
                name: `Institute 55`,
            });

            const john = yield fixtureLoader.createJanusAccount({
                uid: 'john',
                additional_institutes: [institute53.id, institute54.id],
            });
            const jane = yield fixtureLoader.createJanusAccount({
                uid: 'jane',
                additional_institutes: [institute54.id, institute55.id],
            });

            const instituteJanus1 = yield selectByJanusAccountId(john.id);
            assert.deepEqual(instituteJanus1, [
                {
                    id: institute53.id,
                    code: institute53.code,
                    name: institute53.name,
                    index: 0,
                    janus_account_id: john.id,
                },
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 1,
                    janus_account_id: john.id,
                },
            ]);

            const instituteJanus2 = yield selectByJanusAccountId(jane.id);
            assert.deepEqual(instituteJanus2, [
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 0,
                    janus_account_id: jane.id,
                },
                {
                    id: institute55.id,
                    code: institute55.code,
                    name: institute55.name,
                    index: 1,
                    janus_account_id: jane.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByInistAccountIdQuery', function () {
        it('should return additional_institute of user', function* () {
            const institute53 = yield fixtureLoader.createInstitute({
                code: '53',
                name: `Institute 53`,
            });
            const institute54 = yield fixtureLoader.createInstitute({
                code: '54',
                name: `Institute 54`,
            });
            const institute55 = yield fixtureLoader.createInstitute({
                code: '55',
                name: `Institute 55`,
            });

            const john = yield fixtureLoader.createInistAccount({
                username: 'john',
                institutes: [institute53.id, institute54.id],
            });
            const jane = yield fixtureLoader.createInistAccount({
                username: 'jane',
                institutes: [institute54.id, institute55.id],
            });
            assert.deepEqual(yield selectByInistAccountId(john.id), [
                {
                    id: institute53.id,
                    code: institute53.code,
                    name: institute53.name,
                    index: 0,
                    inist_account_id: john.id,
                },
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 1,
                    inist_account_id: john.id,
                },
            ]);
            assert.deepEqual(yield selectByInistAccountId(jane.id), [
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 0,
                    inist_account_id: jane.id,
                },
                {
                    id: institute55.id,
                    code: institute55.code,
                    name: institute55.name,
                    index: 1,
                    inist_account_id: jane.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByUnitIdQuery', function () {
        it('should return additional_institute of user', function* () {
            const institute53 = yield fixtureLoader.createInstitute({
                code: '53',
                name: `Institute 53`,
            });
            const institute54 = yield fixtureLoader.createInstitute({
                code: '54',
                name: `Institute 54`,
            });
            const institute55 = yield fixtureLoader.createInstitute({
                code: '55',
                name: `Institute 55`,
            });

            const cern = yield fixtureLoader.createUnit({
                name: 'cern',
                code: 'cern',
                institutes: [institute53.id, institute54.id],
            });
            const inist = yield fixtureLoader.createUnit({
                name: 'inist',
                code: 'inist',
                institutes: [institute54.id, institute55.id],
            });
            assert.deepEqual(yield selectByUnitId(cern.id), [
                {
                    id: institute53.id,
                    code: institute53.code,
                    name: institute53.name,
                    index: 0,
                    unit_id: cern.id,
                },
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 1,
                    unit_id: cern.id,
                },
            ]);
            assert.deepEqual(yield selectByUnitId(inist.id), [
                {
                    id: institute54.id,
                    code: institute54.code,
                    name: institute54.name,
                    index: 0,
                    unit_id: inist.id,
                },
                {
                    id: institute55.id,
                    code: institute55.code,
                    name: institute55.name,
                    index: 1,
                    unit_id: inist.id,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });
});
