import mongoose, { Schema } from 'mongoose';

import Domain from './Domain';
import oneToMany from './oneToMany';

const schema = new Schema({
    code: { type: String, required: [true, 'code required'], unique: true },
    name: { type: String, required: [true, 'name required'], unique: true },
    domains: [{ type: String, ref: 'Domain' }]
}, {
    versionKey: false
});

oneToMany(schema, 'domains', Domain, 'name');

const Institute = mongoose.model('Institute', schema);

export default Institute;
