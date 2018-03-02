import parseItems from './parseItems';

export default function* retrievePublicationParser(result) {
    return {
        items: [...(yield parseItems(result.Items))],
    };
}
