import User from '../../lib/models/User';
import Domain from '../../lib/models/Domain';
import RenaterHeader from '../../lib/models/RenaterHeader';

export function* createUser(data) {
    const user = new User(data);
    yield user.save();

    return {
        ...user.toObject(),
        password: data.password
    };
}

export function* createDomain(data) {
    const defaultDomain = {
        name: 'vie',
        userId: 'vieUserId',
        password: 'viePassword',
        profile: 'profile_vie'
    };
    const domain = new Domain({
        ...defaultDomain,
        ...data
    });

    yield domain.save();

    return domain.toObject();
}

export function* clear() {
    yield User.remove({});
    yield RenaterHeader.remove({});
    yield Domain.remove({});
}