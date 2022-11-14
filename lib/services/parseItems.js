import co from 'co';
import parseXML from './parseXML';

export default function* parseItems(items = []) {
    return yield items
        .filter((item) => item.Name && item.Data)
        .map((item) => {
            return {
                name: item.Name,
                label: item.Label,
                value: co(parseXML(item.Data)).catch(() => null),
            };
        });
}
