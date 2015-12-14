import User from '../../lib/models/User';
import { hashPassword, generateSalt } from '../../lib/services/passwordHash';

export function* createUser(data) {
    data.salt = yield generateSalt();
    data.hash = yield hashPassword(data.password, data.salt);
    const user = new User(data);
    yield user.save();

    return {
        ...user.toObject(),
        password: data.password
    };
}

export function* clear() {
    yield User.remove({});
}
