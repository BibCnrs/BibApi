import mongoose, { Schema } from 'mongoose';
import co from 'co';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const schema = new Schema({
    username: { type: String, default: '', unique: true },
    password: { type: String, default: '' },
    salt: { type: String, default: ''},
    domains: [{ type: String, default: '' }]
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')){
        return next();
    }
    co(function* () {
        user.salt = yield generateSalt();
        user.password = yield hashPassword(user.password, user.salt);
        next();
    })
    .catch(next);
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