import mongoose, { Schema } from 'mongoose';
import co from 'co';

import Domain from './Domain';
import Institute from './Institute';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';

const schema = new Schema({
    username: { type: String, default: '', unique: true },
    password: { type: String, default: '' },
    salt: { type: String, default: ''},
    institute: { type: String, ref: 'Institute' },
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let user = this;
    co(function* () {
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

oneToMany(schema, 'domains', Domain);
oneToOne(schema, 'institute', Institute, 'name');

const User = mongoose.model('User', schema);

export default User;
