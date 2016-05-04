import mongoose, { Schema } from 'mongoose';

import Domain from './Domain';
import oneToMany from './oneToMany';

const schema = new Schema({
    name: { type: String, default: '', unique: true },
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

oneToMany(schema, 'domains', Domain);

const Unit = mongoose.model('Unit', schema);

export default Unit;
