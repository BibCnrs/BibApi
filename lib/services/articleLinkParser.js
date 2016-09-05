import defaultTo, { defaultToEmptyArray } from '../utils/defaultTo';

export const extractFullTextLinks = defaultToEmptyArray(function extractFullTextLinks(result) {
    return result.FullText.CustomLinks
    .filter(({Category}) => Category === 'fullText')
    .map((link) => ({
        url: link.Url.replace(/&amp;/g, '&'),
        name: link.Name
    }));
});

export const extractPdfLinks = defaultToEmptyArray((result) => {
    return result.FullText.Links
    .filter(({ Type, Url }) => Type === 'pdflink' && !!Url)
    .map(({ Url }) => ({ url: Url }));
});

export const extractArticleLinks = defaultTo({
    fullTextLinks: [],
    pdfLinks: []
})(function extractArticleLinks(result) {
    const fullTextLinks = extractFullTextLinks(result) || [];

    return {
        fullTextLinks,
        pdfLinks: extractPdfLinks(result)
    };
});

export default extractArticleLinks;
