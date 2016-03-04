import cleanXml from './cleanXml';
import _ from 'lodash';

export default function clean(text) {
    return _.unescape(cleanXml(text));
}
