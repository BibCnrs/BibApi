import parseXML from './parseXML';
import _ from 'lodash';

export default function* articleLinkParser(record) {

    if (record.FullText.Links) {
        return record.FullText.Links.map(link => link.Url);
    }

    const availabilities = (yield record.Items.filter(item => {
        return item.Name === 'Avail';
    }).map(item => parseXML(item.Data)));

    return _.flattenDeep(availabilities).filter(d => !!d.url).map(d => d.url);
}
