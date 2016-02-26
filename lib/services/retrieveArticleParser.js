import parseItems from './parseItems';

export default function (result) {
    return [
        ...parseItems(result.Items),
        {
            name: 'db',
            label: result.Header ? result.Header.DbLabel: undefined,
            value: result.Header ? result.Header.DbId: undefined
        }
    ];
}
