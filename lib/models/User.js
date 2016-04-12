import mongoose, { Schema } from 'mongoose';
import co from 'co';

import Domain from './Domain';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const schema = new Schema({
    username: { type: String, default: '', unique: true },
    password: { type: String, default: '' },
    salt: { type: String, default: ''},
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let user = this;
    co(function* () {
        const domains = yield user.domains
        .map(name => Domain.findByName(name));

        user.domains = domains
        .filter(domain => !!domain)
        .map(domain => domain._id);

        if (!user.isModified('password')){
            return next();
        }
        user.salt = yield generateSalt();
        user.password = yield hashPassword(user.password, user.salt);
        next();
    })
    .catch(next);
});

schema.pre('findOneAndUpdate', function (next) {
    let query = this;
    co(function* () {
        if (query._update.domains) {
            const domains = yield query._update.domains
            .map(name => Domain.findByName(name));

            query._update.domains = domains
            .filter(domain => !!domain)
            .map(domain => domain._id);
        }
        if (!query._update.password){
            delete query._update.password;
            return next();
        }
        query._update.salt = yield generateSalt();
        query._update.password = yield hashPassword(query._update.password, query._update.salt);
        return next();
    })
    .catch(next);
});

const domainIdToName = function* (user) {
    const domains = yield user.domains.map(domain => Domain.findById(domain));

    user.domains = domains.map(domain => domain.name);
};

const postFindHook = function (users, next)  {
    users = [].concat(users);
    co(function* () {
        yield users.map(domainIdToName);
        next();
    })
    .catch(error => next(error));
};

schema.post('find', postFindHook);
schema.post('findOne', postFindHook);
schema.post('findOneAndUpdate', postFindHook);
schema.post('save', postFindHook);

schema.virtual('gatesPromises').get(function () {
    return this.domains.map((name) => co(function* () {
        const domain = yield Domain.findByName(name);
        return domain.gate;
    }));
});

schema.statics.authenticate = function* (username, password){
    const user =  yield User.findOne({
        username
    }, {
        id: 1,
        username: 1,
        salt: 1,
        password: 1,
        domains: 1
    });

    if (!user || !(yield isPasswordValid(password, user.get('salt'), user.get('password')))) {
        return false;
    }

    return user;
};

const User = mongoose.model('User', schema);

export default User;
