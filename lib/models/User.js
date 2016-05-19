import mongoose, { Schema } from 'mongoose';
import co from 'co';
import _ from 'lodash';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';

const schema = new Schema({
    username: { type: String, default: '', unique: true },
    password: { type: String, default: undefined },
    salt: { type: String, default: undefined },
    primaryInstitute: { type: String, ref: 'Institute', default: undefined },
    additionalInstitutes: [{ type: String, ref: 'Institute', default: undefined }],
    primaryUnit: { type: String, ref: 'Unit' },
    additionalUnits: [{ type: String, ref: 'Unit' }],
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let user = this;
    co(function* () {
        if (!user.password || !user.isModified('password')){
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

const getWeight = (list, attrName) => {
    return list.reduce((result, value, index) => {
        return {
            $cond: {
                if: { $eq: [ `$${attrName}`, value ] },
                then: index + 1,
                else: result
            }
        };
    }, null);
};

schema.virtual('instituteDomains').get(function () {
    const institutes = [].concat(this.primaryInstitute).concat(this.additionalInstitutes);
    if(!institutes || institutes.length === 0) {
        return [];
    }
    const weight = getWeight(institutes, 'code');

    return Institute.aggregate([
        {
            $match: {
                code: { $in: institutes }
            }
        }, {
            $project: {
                weight: weight,
                domains: 1
            }
        }, {
            $sort: { weight: 1 }
        }
    ])
    .exec()
    .then(institutes => co(function* () {
        if (!institutes || institutes.length === 0) {
            return [];
        }

        return yield institutes.reduce((result, institute) => [
            ...result,
            ...(institute.domains || [])
        ], [])
        .map(_id => Domain.findOne({ _id }));
    }));
});

schema.virtual('unitDomains').get(function () {
    const units = [].concat(this.primaryUnit).concat(this.additionalUnits);
    if(!units || units.length === 0) {
        return [];
    }
    const weight = getWeight(units, 'name');

    return Unit.aggregate([
        {
            $match: {
                name: { $in: units }
            }
        }, {
            $project: {
                weight: weight,
                domains: 1
            }
        }, {
            $sort: { weight: 1 }
        }
    ])
    .exec()
    .then(units => co(function* () {
        if (!units || units.length === 0) {
            return [];
        }

        return yield units.reduce((result, unit) => [
            ...result,
            ...(unit.domains || [])
        ], [])
        .map(_id => Domain.findOne({ _id }));
    }));

});

schema.virtual('domainsData').get(function () {
    return this.domains.map((name) => co(function* () {
        const domain = yield Domain.findByName(name);
        return domain;
    }));
});

schema.virtual('allDomains').get(function () {
    const self = this;
    return co(function* () {
        return _.uniqBy([
            ...yield self.instituteDomains,
            ...yield self.unitDomains,
            ...yield self.domainsData
        ], (value) => value.name);
    });
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

oneToMany(schema, 'domains', Domain, 'name');
oneToMany(schema, 'additionalInstitutes', Institute, 'code');
oneToOne(schema, 'primaryInstitute', Institute, 'code');
oneToMany(schema, 'additionalUnits', Unit, 'name');
oneToOne(schema, 'primaryUnit', Unit, 'name');

const User = mongoose.model('User', schema);

export default User;
