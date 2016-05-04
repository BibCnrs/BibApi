import mongoose, { Schema } from 'mongoose';
import co from 'co';

import Domain from './Domain';

const schema = new Schema({
    code: { type: String, default: '', unique: true },
    name: { type: String, default: '', unique: true },
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

schema.pre('save', function (next) {
    let institute = this;
    co(function* () {
        const domains = yield institute.domains
        .map(name => Domain.findByName(name));

        institute.domains = domains
        .filter(domain => !!domain)
        .map(domain => domain._id);

        return next();
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

        return next();
    })
    .catch(next);
});

const domainIdToName = function* (institute) {
    if (!institute) {
        return;
    }
    const domains = yield institute.domains.map(domain => Domain.findById(domain));

    institute.domains = domains.map(domain => domain.name);
};

const postFindHook = function (institutes, next)  {
    institutes = [].concat(institutes);
    co(function* () {
        yield institutes.map(domainIdToName);
        next();
    })
    .catch(error => next(error));
};

schema.post('find', postFindHook);
schema.post('findOne', postFindHook);
schema.post('findOneAndUpdate', postFindHook);
schema.post('save', postFindHook);

const Institute = mongoose.model('Institute', schema);

export default Institute;
