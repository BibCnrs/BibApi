import User from '../../lib/models/User';
import AdminUser from '../../lib/models/AdminUser';
import Domain from '../../lib/models/Domain';
import RenaterHeader from '../../lib/models/RenaterHeader';
import Institute from '../../lib/models/Institute';
import Unit from '../../lib/models/Unit';

export default function (postgres) {
    const adminUserQueries = AdminUser(postgres);

    function* createAdminUser(data) {
        return yield adminUserQueries.insertOne(data);
    }

    function* createUser(data) {
        const defaultUser = {
            name: 'Doe',
            firstname: 'John',
            domains: []
        };
        const user = yield User.create({
            ...defaultUser,
            ...data
        });

        return {
            ...user.toObject(),
            password: data.password
        };
    }

    function* createDomain(data) {
        const defaultDomain = {
            name: 'vie',
            gate: 'insb',
            userId: 'vieUserId',
            password: 'viePassword',
            profile: 'profile_vie'
        };
        const domain = yield Domain.create({
            ...defaultDomain,
            ...data
        });

        return domain.toObject();
    }

    function* createInstitute(data) {
        const defaultInstitute = {
            code: '53',
            name: 'Institut des sciences biologique',
            domains: []
        };
        const institute = yield Institute.create({
            ...defaultInstitute,
            ...data
        });

        return institute.toObject();
    }

    function* createUnit(data) {
        const defaultUnit = {
            name: 'Unité pluriel',
            domains: []
        };
        const unit = yield Unit.create({
            ...defaultUnit,
            ...data
        });

        return unit.toObject();
    }

    function* clear() {
        yield postgres.query({ sql: 'TRUNCATE admin_user' });
        yield User.remove({});
        yield RenaterHeader.remove({});
        yield Domain.remove({});
        yield Institute.remove({});
        yield Unit.remove({});
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
