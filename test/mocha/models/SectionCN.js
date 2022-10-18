import {
    getSectionCN,
    insertOne,
    selectByIds,
    selectOne,
    updateOne,
} from '../../../lib/models/SectionCN';
import prisma from '../../../prisma/prisma';

describe('model SectionCN', function () {
    describe('selectOne', function () {
        let primaryInstitute, secondaryInstitute, section;

        before(function* () {
            primaryInstitute = yield fixtureLoader.createInstitute({
                name: 'primary',
                code: '1',
            });
            secondaryInstitute = yield fixtureLoader.createInstitute({
                name: 'secondary',
                code: '2',
            });
            section = yield fixtureLoader.createSectionCN({
                name: 'section',
                code: '007',
                comment: 'no comment',
                primary_institutes: primaryInstitute.id,
                secondary_institutes: [secondaryInstitute.id],
            });
        });

        it('should return one institute by id', function* () {
            assert.deepEqual(yield selectOne(section.id), {
                id: section.id,
                name: 'section',
                code: '007',
                comment: 'no comment',
                primary_institutes: [primaryInstitute.id],
                secondary_institutes: [secondaryInstitute.id],
            });
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectPage', function () {
        let biology, chemestry, humanity, ds50, ds51, ds52, ds53;
        before(function* () {
            ds50 = yield fixtureLoader.createInstitute({
                name: 'ds50',
                code: 'ds50',
            });

            ds51 = yield fixtureLoader.createInstitute({
                name: 'ds51',
                code: 'ds51',
            });

            ds52 = yield fixtureLoader.createInstitute({
                name: 'ds52',
                code: 'ds52',
            });

            ds53 = yield fixtureLoader.createInstitute({
                name: 'ds53',
                code: 'ds53',
            });

            chemestry = yield fixtureLoader.createSectionCN({
                name: 'chemestry',
                code: '52',
                comment: 'chemistry comment',
                primary_institutes: ds50.id,
                secondary_institutes: [ds51.id, ds52.id, ds53.id],
            });
            biology = yield fixtureLoader.createSectionCN({
                name: 'biology',
                comment: 'biology comment',
                code: '53',
                primary_institutes: ds51.id,
                secondary_institutes: [ds53.id],
            });
            humanity = yield fixtureLoader.createSectionCN({
                name: 'humanity',
                code: '54',
                comment: 'humanity comment',
                primary_institutes: ds50.id,
                secondary_institutes: [ds52.id],
            });
        });

        it('should return all institute', function* () {
            assert.deepEqual(yield getSectionCN(), [
                {
                    id: chemestry.id,
                    name: 'chemestry',
                    code: '52',
                    comment: chemestry.comment,
                    primary_institutes: [ds50.id],
                    secondary_institutes: [ds51.id, ds52.id, ds53.id],
                },
                {
                    id: biology.id,
                    name: 'biology',
                    code: '53',
                    comment: biology.comment,
                    primary_institutes: [ds51.id],
                    secondary_institutes: [ds53.id],
                },
                {
                    id: humanity.id,
                    name: 'humanity',
                    code: '54',
                    comment: humanity.comment,
                    primary_institutes: [ds50.id],
                    secondary_institutes: [ds52.id],
                },
            ]);
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('updateOne', function () {
        let section, institute1, institute2, institute3;

        beforeEach(function* () {
            yield fixtureLoader.clear();
            institute1 = yield fixtureLoader.createInstitute({
                name: 'institute1',
                code: 'institute1',
            });
            institute2 = yield fixtureLoader.createInstitute({
                name: 'institute2',
                code: 'institute2',
            });
            institute3 = yield fixtureLoader.createInstitute({
                name: 'institute3',
                code: 'institute3',
            });

            section = yield fixtureLoader.createSectionCN({
                name: 'section',
                primary_institutes: institute1.id,
                secondary_institutes: [institute2.id],
            });
        });

        it('should throw an error if trying to add an institute to secondary_institutes which does not exists and abort modification', function* () {
            let error;
            try {
                yield updateOne(section.id, {
                    secondary_institutes: [1200, institute1.id],
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes 1200 does not exists');

            const sectionCNInstitutes =
                yield prisma.section_cn_secondary_institute.findMany({
                    where: {
                        section_cn_id: section.id,
                    },
                });
            assert.deepEqual(sectionCNInstitutes, [
                {
                    section_cn_id: section.id,
                    institute_id: institute2.id,
                    index: 0,
                },
            ]);
        });

        it('should replace primary_institute with given institute', function* () {
            yield updateOne(section.id, {
                primary_institutes: institute2.id,
            });

            const sectionCNPrimaryInstitute =
                yield prisma.section_cn_primary_institute.findMany({
                    where: {
                        section_cn_id: section.id,
                    },
                });
            assert.deepEqual(sectionCNPrimaryInstitute, [
                {
                    section_cn_id: section.id,
                    institute_id: institute1.id,
                    index: 0,
                },
            ]);
        });

        it('should replace secondary_institute with given institute', function* () {
            yield updateOne(section.id, {
                secondary_institutes: [institute1.id, institute3.id],
            });

            const sectionCNSecondaryInstitute =
                yield prisma.section_cn_secondary_institute.findMany({
                    where: {
                        section_cn_id: section.id,
                    },
                });
            assert.deepEqual(sectionCNSecondaryInstitute, [
                {
                    section_cn_id: section.id,
                    institute_id: institute1.id,
                    index: 0,
                },
                {
                    section_cn_id: section.id,
                    institute_id: institute3.id,
                    index: 1,
                },
            ]);
        });
    });

    describe('insertOne', function () {
        let primary, secondary;

        beforeEach(function* () {
            [primary, secondary] = yield ['primary', 'secondary'].map((name) =>
                fixtureLoader.createInstitute({
                    name,
                    code: name,
                }),
            );
        });

        it('should add given institutes if they exists', function* () {
            const section = yield insertOne({
                name: 'section',
                code: '53',
                primary_institutes: primary.id,
                secondary_institutes: [secondary.id],
            });

            const sectionCNPrimaryInstitutes =
                yield prisma.section_cn_primary_institute.findMany({
                    where: {
                        section_cn_id: section.id,
                    },
                });

            assert.deepEqual(sectionCNPrimaryInstitutes, [
                {
                    section_cn_id: section.id,
                    institute_id: primary.id,
                    index: 0,
                },
            ]);

            const sectionCNSecondaryInstitutes =
                yield prisma.section_cn_secondary_institute.findMany({
                    where: {
                        section_cn_id: section.id,
                    },
                });

            assert.deepEqual(sectionCNSecondaryInstitutes, [
                {
                    section_cn_id: section.id,
                    institute_id: secondary.id,
                    index: 0,
                },
            ]);
        });

        afterEach(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectByIds', function () {
        let section1, section2;

        before(function* () {
            const institute1 = yield fixtureLoader.createInstitute({
                name: 'institute1',
                code: 'institute1',
            });
            const institute2 = yield fixtureLoader.createInstitute({
                name: 'institute2',
                code: 'institute2',
            });

            section1 = yield fixtureLoader.createSectionCN({
                code: '0',
                name: 'SectionCN 0',
                primary_institutes: institute1.id,
            });
            section2 = yield fixtureLoader.createSectionCN({
                code: '1',
                name: 'SectionCN 1',
                primary_institutes: institute2.id,
            });
        });

        it('should return each sectionsCN with given ids', function* () {
            assert.deepEqual(yield selectByIds([section1.id, section2.id]), [
                {
                    id: section1.id,
                    name: section1.name,
                    code: section1.code,
                },
                {
                    id: section2.id,
                    name: section2.name,
                    code: section2.code,
                },
            ]);
        });

        it('should throw an error if trying to retrieve an institute that does not exists', function* () {
            let error;

            try {
                yield selectByIds([section1.id, section2.id, 0]);
            } catch (e) {
                error = e;
            }
            assert.equal(error.message, 'SectionsCN 0 does not exists');
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });
});
