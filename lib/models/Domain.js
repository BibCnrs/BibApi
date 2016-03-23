import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
    name: { type: String, default: '', unique: true },
    gate: { type: String, default: '' },
    userId: { type: String, default: '' },
    password: { type: String, default: '' },
    profile: { type: String, default: ''}
}, {
    versionKey: false
});

schema.statics.findByName = function* (name) {
    const domain = yield Domain.findOne({ name: name });
    if(!domain) {
        const error = new Error(`Domain ${name} does not exists`);
        error.status = 500;
        throw error;
    }

    return domain;
};
const Domain = mongoose.model('Domain', schema);

export default Domain;
