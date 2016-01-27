import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
    name: { type: String, default: '', unique: true },
    userId: { type: String, default: '' },
    password: { type: String, default: '' },
    profile: { type: String, default: ''}
}, {
    versionKey: false
});

const Domain = mongoose.model('Domain', schema);

export default Domain;
