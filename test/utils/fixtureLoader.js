import User from '../../lib/models/User';
import RenaterHeader from '../../lib/models/RenaterHeader';

export function* createUser(data) {
    const user = new User(data);
    yield user.save();

    return {
        ...user.toObject(),
        password: data.password
    };
}

export function* clear() {
    yield User.remove({});
    yield RenaterHeader.remove({});
}
