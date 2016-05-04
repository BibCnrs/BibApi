import mongoose, { Schema } from 'mongoose';

import Domain from './Domain';
import oneToMany from './oneToMany';

const schema = new Schema({
    code: { type: String, default: '', unique: true },
    name: { type: String, default: '', unique: true },
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

oneToMany(schema, 'domains', Domain);

const Institute = mongoose.model('Institute', schema);

export default Institute;
