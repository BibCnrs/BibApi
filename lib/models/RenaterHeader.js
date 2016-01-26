import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
    displayname: { type: String, default: '' },
    cn: { type: String, default: '' },
    mail: { type: String, default: '' }
}, {
    versionKey: false,
    strict: false
});

const RenaterHeader = mongoose.model('RenaterHeader', schema);

export default RenaterHeader;
