import mongoose, { Schema } from 'mongoose';
import { isPasswordValid } from '../services/passwordHash';

const schema = new Schema({
    username: { type: String, default: '' },
    hash: { type: String, default: '' },
    salt: { type: String, default: ''},
    domains: [{ type: String, default: '' }]
}, {
    versionKey: false
});

schema.statics.authenticate = function* (username, password){
    const user =  yield User.findOne({
        username
    }, {
        id: 1,
        username: 1,
        salt: 1,
        hash: 1,
        domains: 1
    });

    if (!user || !(yield isPasswordValid(password, user.get('salt'), user.get('hash')))) {
        return false;
    }

    return user;
};

const User = mongoose.model('User', schema);

export default User;
