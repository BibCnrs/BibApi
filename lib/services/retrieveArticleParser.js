import parseItems from './parseItems';

export default function* (result) {
    return [
        ...yield (parseItems(result.Items)),
        {
            name: 'db',
            label: result.Header ? result.Header.DbLabel: undefined,
            value: result.Header ? result.Header.DbId: undefined
        }
    ];
}
