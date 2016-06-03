import User from '../../lib/models/User';
import AdminUser from '../../lib/models/AdminUser';
import Domain from '../../lib/models/Domain';
import RenaterHeader from '../../lib/models/RenaterHeader';
import Institute from '../../lib/models/Institute';
import Unit from '../../lib/models/Unit';

export default function (postgres) {
    const adminUserQueries = AdminUser(postgres);
    const domainQueries = Domain(postgres);
    const userQueries = User(postgres);
    const instituteQueries = Institute(postgres);
    const unitQueries = Unit(postgres);

    function* createAdminUser(data) {
        return yield adminUserQueries.insertOne(data);
    }

    function* createDomain(data) {
        const defaultDomain = {
            name: 'vie',
            gate: 'insb',
            user_id: 'vieUserId',
            password: 'viePassword',
            profile: 'profile_vie'
        };

        return yield domainQueries.insertOne({
            ...defaultDomain,
            ...data
        });
    }

    function* createUser(data) {
        const defaultUser = {
            name: 'Doe',
            firstname: 'John'
        };

        const user = yield userQueries.insertOne({
            ...defaultUser,
            ...data
        });

        return {
            ...user,
            password: data.password
        };
    }

    function* createInstitute(data) {
        const defaultInstitute = {
            code: '53',
            name: 'Institut des sciences biologique',
            domains: []
        };
        return yield instituteQueries.insertOne({
            ...defaultInstitute,
            ...data
        });
    }

    function* createUnit(data) {
        const defaultUnit = {
            code: 'Unité pluriel',
            domains: []
        };
        return yield unitQueries.insertOne({
            ...defaultUnit,
            ...data
        });
    }

    function* clear() {
        yield postgres.query({ sql: 'DELETE FROM admin_user' });
        yield postgres.query({ sql: 'DELETE FROM domain CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM bib_user CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM institute CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM unit CASCADE' });
        yield RenaterHeader.remove({});
    }

    return {
        createAdminUser,
        createUser,
        createDomain,
        createInstitute,
        createUnit,
        clear
    };
}
