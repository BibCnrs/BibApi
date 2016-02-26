import parseItems from './parseItems';

export default function retrievePublicationParser(result) {
    return [
        ...parseItems(result.Items)
    ];
}
