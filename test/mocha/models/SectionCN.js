import SectionCN from '../../../lib/models/SectionCN';

describe('model SectionCN', function () {
    let sectionCNQueries;

    before(function () {
        sectionCNQueries = SectionCN(postgres);
    });

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
            assert.deepEqual(
                yield sectionCNQueries.selectOne({
                    id: section.id,
                }),
                {
                    id: section.id,
                    name: 'section',
                    code: '007',
                    comment: 'no comment',
                    primary_institutes: [primaryInstitute.id],
                    secondary_institutes: [secondaryInstitute.id],
                },
            );
        });

        after(function* () {
            yield fixtureLoader.clear();
        });
    });

    describe('selectPage', function () {
        let biology, chemestry, humanity, ds50, ds51, ds52, ds53;
        before(function* () {
            [ds50, ds51, ds52, ds53] = yield [
                'ds50',
                'ds51',
                'ds52',
                'ds53',
            ].map((name) =>
                fixtureLoader.createInstitute({
                    name,
                    code: name,
                }),
            );

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
            assert.deepEqual(yield sectionCNQueries.selectPage(), [
                {
                    id: chemestry.id,
                    totalcount: '3',
                    name: 'chemestry',
                    code: '52',
                    comment: chemestry.comment,
                    primary_institutes: [ds50.id],
                    secondary_institutes: [ds51.id, ds52.id, ds53.id],
                },
                {
                    id: biology.id,
                    totalcount: '3',
                    name: 'biology',
                    code: '53',
                    comment: biology.comment,
                    primary_institutes: [ds51.id],
                    secondary_institutes: [ds53.id],
                },
                {
                    id: humanity.id,
                    totalcount: '3',
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
            [institute1, institute2, institute3] = yield [
                'institute1',
                'institute2',
                'institute3',
            ].map((name) =>
                fixtureLoader.createInstitute({
                    name,
                    code: name,
                }),
            );

            section = yield fixtureLoader.createSectionCN({
                name: 'section',
                primary_institutes: institute1.id,
                secondary_institutes: [institute2.id],
            });
        });

        it('should throw an error if trying to add an institute to secondary_institutes which does not exists and abort modification', function* () {
            let error;
            try {
                yield sectionCNQueries.updateOne(section.id, {
                    secondary_institutes: ['nemo', institute1.id],
                });
            } catch (e) {
                error = e.message;
            }

            assert.equal(error, 'Institutes nemo does not exists');

            const sectionCNInstitutes = yield postgres.query({
                sql: 'SELECT * FROM section_cn_secondary_institute WHERE section_cn_id=$id',
                parameters: { id: section.id },
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
            yield sectionCNQueries.updateOne(section.id, {
                primary_institutes: institute2.id,
            });

            const sectionCNPrimaryInstitute = yield postgres.query({
                sql: 'SELECT * FROM section_cn_primary_institute WHERE section_cn_id=$id',
                parameters: { id: section.id },
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
            yield sectionCNQueries.updateOne(section.id, {
                secondary_institutes: [institute1.id, institute3.id],
            });

            const sectionCNSecondaryInstitute = yield postgres.query({
                sql: 'SELECT * FROM section_cn_secondary_institute WHERE section_cn_id=$id',
                parameters: { id: section.id },
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
            const section = yield sectionCNQueries.insertOne({
                name: 'section',
                code: '53',
                primary_institutes: primary.id,
                secondary_institutes: [secondary.id],
            });

            const sectionCNPrimaryInstitutes = yield postgres.query({
                sql: 'SELECT * FROM section_cn_primary_institute WHERE section_cn_id=$id ORDER BY index',
                parameters: { id: section.id },
            });
            assert.deepEqual(sectionCNPrimaryInstitutes, [
                {
                    section_cn_id: section.id,
                    institute_id: primary.id,
                    index: 0,
                },
            ]);

            const sectionCNSecondaryInstitutes = yield postgres.query({
                sql: 'SELECT * FROM section_cn_secondary_institute WHERE section_cn_id=$id ORDER BY index',
                parameters: { id: section.id },
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
            const listInstitute = yield ['institute1', 'institute2'].map(
                (name) =>
                    fixtureLoader.createInstitute({
                        name,
                        code: name,
                    }),
            );
            [section1, section2] = yield ['0', '1'].map((code) =>
                fixtureLoader.createSectionCN({
                    code,
                    name: `SectionCN ${code}`,
                    primary_institutes: listInstitute[code].id,
                }),
            );
        });

        it('should return each sectionsCN with given ids', function* () {
            assert.deepEqual(
                yield sectionCNQueries.selectByIds([section1.id, section2.id]),
                [
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
                ],
            );
        });

        it('should throw an error if trying to retrieve an institute that does not exists', function* () {
            let error;

            try {
                yield sectionCNQueries.selectByIds([
                    section1.id,
                    section2.id,
                    0,
                ]);
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
