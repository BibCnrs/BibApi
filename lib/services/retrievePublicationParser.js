import parseItems from './parseItems';

export default function* retrievePublicationParser(result) {
    return [
        ...yield parseItems(result.Items)
    ];
}
