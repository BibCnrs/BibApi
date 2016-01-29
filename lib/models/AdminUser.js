import mongoose, { Schema } from 'mongoose';
import co from 'co';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';

const schema = new Schema({
    username: { type: String, default: '', unique: true },
    password: { type: String, default: '' },
    salt: { type: String, default: ''}
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let adminUser = this;
    if (!adminUser.isModified('password')){
        return next();
    }
    co(function* () {
        adminUser.salt = yield generateSalt();
        adminUser.password = yield hashPassword(adminUser.password, adminUser.salt);
        next();
    })
    .catch(next);
});

schema.statics.authenticate = function* (username, password){
    const adminUser =  yield AdminUser.findOne({
        username
    }, {
        id: 1,
        username: 1,
        salt: 1,
        password: 1
    });

    if (!adminUser || !(yield isPasswordValid(password, adminUser.get('salt'), adminUser.get('password')))) {
        return false;
    }

    return adminUser;
};

const AdminUser = mongoose.model('AdminUser', schema);

export default AdminUser;
