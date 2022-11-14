import parseItems from './parseItems';
import articleLinkParser from './articleLinkParser';

export default function* (result, domain) {
    const isRetrieve = true;
    return {
        items: yield parseItems(result.Items),
        dbLabel: result.Header ? result.Header.DbLabel : undefined,
        dbId: result.Header ? result.Header.DbId : undefined,
        articleLinks: yield articleLinkParser(result, domain, isRetrieve),
    };
}
