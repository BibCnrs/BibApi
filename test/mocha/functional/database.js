import { sortByLetter } from '../../../lib/controller/ebsco/database';

describe('GET /ebsco/database', function () {
    let cnrs;
    let inist;
    let insb;
    let marmelab;
    before(function* () {
        const vie = yield fixtureLoader.createCommunity({ name: 'vie', user_id: 'userIdVie', password: 'passwordVie', profile: 'profileVie' });
        const shs = yield fixtureLoader.createCommunity({ name: 'shs', user_id: 'userIdShs', password: 'passwordShs', profile: 'profileShs' });

        marmelab = yield fixtureLoader.createDatabase({ name: 'marmelab', communities: [vie.id, shs.id] });
        marmelab = {
            ...marmelab,
            communities: [vie.id, shs.id],
            domains: [vie.name, shs.name],
            totalcount: '4',
        };

        cnrs = yield fixtureLoader.createDatabase({ name: 'cnrs', communities: [shs.id] });
        cnrs = {
            ...cnrs,
            communities: [shs.id],
            domains: [shs.name],
            totalcount: '4',
        };

        inist = yield fixtureLoader.createDatabase({ name: 'inist', communities: [vie.id] });
        inist = {
            ...inist,
            communities: [vie.id],
            domains: [vie.name],
            totalcount: '4',
        };

        insb = yield fixtureLoader.createDatabase({ name: 'insb', communities: [vie.id] });
        insb = {
            ...insb,
            communities: [vie.id],
            domains: [vie.name],
            totalcount: '4',
        };
    });

    it('should return username, domains from cookie_token and header_token saved in redis in cookie_token shib key and delete it from redis', function* () {
        const response = yield request.get('/ebsco/databases');
        assert.deepEqual(JSON.parse(response.body), {
            c: [cnrs],
            i: [inist, insb],
            m: [marmelab],
        });
    });

    after(function* () {
        yield fixtureLoader.clear();
    });

    describe('sortByLetter', () => {
        it('should split array of string to literal with key as letter', () => {
            const data = ['john', 'johnny', 'jane', 'eric'].map(name => ({ name }));
            assert.deepEqual(sortByLetter(data), { j: [data[0], data[1], data[2]], e: [data[3]] });
        });

        it('should ignore case', () => {
            const data = ['john', 'Johnny'].map(name => ({ name }));
            assert.deepEqual(sortByLetter(data), { j: [data[0], data[1]] });
        });
    });
});