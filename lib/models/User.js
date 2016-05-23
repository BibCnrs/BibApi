import mongoose, { Schema } from 'mongoose';
import co from 'co';
import _ from 'lodash';

import Domain from './Domain';
import Institute from './Institute';
import Unit from './Unit';
import { isPasswordValid, hashPassword, generateSalt } from '../services/passwordHash';
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';

import { crud, selectOne } from 'co-postgres-queries';

const userQueries = crud('bib_user', ['username', 'password', 'salt', 'institute', 'unit'], ['id'], ['*'], [
    (queries) => {
        queries.selectOne.table('bib_user');
        queries.selectOne.returnFields([
            'username',
            'password',
            'salt',
            'institute',
            'unit',
            `ARRAY((SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = $id)) AS domains`
        ]);
        queries.selectPage.table('bib_user');
        queries.selectPage.returnFields([
            'username',
            'password',
            'salt',
            'institute',
            'unit',
            `ARRAY((SELECT name FROM domain JOIN bib_user_domain ON (domain.id = bib_user_domain.domain_id) WHERE bib_user_domain.bib_user_id = bib_user.id)) AS domains`
        ]);

    }
]);

export default (client) => {
    const domainQueries = Domain(client);
    const queries = userQueries(client);
    const baseUpdateOne = queries.updateOne;

    queries.updateOne = function* (selector, values) {
        return yield co(function* () {
            yield client.begin();
            const updatedUser = yield baseUpdateOne(selector, values);

            if (values.domains) {
                const domains = yield values.domains.map(name => domainQueries.selectOneByName({name}));
                yield userDomainQueries.batchInsert(domains.map(domain => ({ domain_id: domain.id, bib_user_id: user.id })));
            }

            yield client.commit();


            return updatedUser;
        })
        .catch(e => {
            client.rollback().then(() => {throw e;});
        });

    };

    return queries;
};

//
// const schema = new Schema({
//     username: { type: String, default: '', unique: true },
//     password: { type: String, default: undefined },
//     salt: { type: String, default: undefined },
//     institute: { type: String, ref: 'Institute', default: undefined },
//     unit: { type: String, ref: 'Unit' },
//     domains: [{ type: String, ref: 'Domain' }]
// }, {
//     versionKey: false
// });
//
// schema.pre('save', function (next) {
//     let user = this;
//     co(function* () {
//         if (!user.password || !user.isModified('password')){
//             return next();
//         }
//         user.salt = yield generateSalt();
//         user.password = yield hashPassword(user.password, user.salt);
//         next();
//     })
//     .catch(next);
// });
//
// schema.pre('findOneAndUpdate', function (next) {
//     let query = this;
//     co(function* () {
//         if (!query._update.password){
//             delete query._update.password;
//             return next();
//         }
//         query._update.salt = yield generateSalt();
//         query._update.password = yield hashPassword(query._update.password, query._update.salt);
//         return next();
//     })
//     .catch(next);
// });
//
// schema.virtual('gatesPromises').get(function () {
//     return this.domains.map((name) => co(function* () {
//         const domain = yield Domain.selectOneByName(name);
//         return domain.gate;
//     }));
// });
//
// schema.virtual('instituteDomains').get(function () {
//     return Institute.findOne({ code: this.institute })
//     .then(institute => co(function* () {
//         if (!institute) {
//             return [];
//         }
//         return yield institute.domains
//         .map(name => Domain.findOne({ name }));
//     }));
// });
//
// schema.virtual('unitDomains').get(function () {
//     return Unit.findOne({ name: this.unit })
//     .then(unit => co(function* () {
//         if (!unit) {
//             return [];
//         }
//         return yield unit.domains
//         .map(name => Domain.findOne({ name }));
//     }));
// });
//
// schema.virtual('domainsData').get(function () {
//     return this.domains.map((name) => co(function* () {
//         const domain = yield Domain.selectOneByName(name);
//         return domain;
//     }));
// });
//
// schema.virtual('allDomains').get(function () {
//     const self = this;
//     return co(function* () {
//         return _.uniqBy([
//             ...yield self.instituteDomains,
//             ...yield self.unitDomains,
//             ...yield self.domainsData
//         ], (value) => value.name);
//     });
// });
//
// schema.statics.authenticate = function* (username, password){
//     const user =  yield User.findOne({
//         username
//     }, {
//         id: 1,
//         username: 1,
//         salt: 1,
//         password: 1,
//         domains: 1
//     });
//
//     if (!user || !(yield isPasswordValid(password, user.get('salt'), user.get('password')))) {
//         return false;
//     }
//
//     return user;
// };
//
// oneToMany(schema, 'domains', Domain, 'name');
// oneToOne(schema, 'institute', Institute, 'code');
// oneToOne(schema, 'unit', Unit, 'name');
//
// const User = mongoose.model('User', schema);
//
// export default User;
