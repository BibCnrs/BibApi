import clean from '../utils/clean';

export default function parseItems(items = []) {
    return items
    .filter((item) => item.Name && item.Data)
    .map((item) => {
        return {
            name: item.Name,
            label: item.Label,
            value: clean(item.Data)
        };
    });
}
