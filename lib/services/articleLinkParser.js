import { defaultToEmptyArray } from '../utils/defaultTo';
import parseXML from './parseXML';

function extractText(data) {
    if(!data || typeof data === 'string') {
        return data;
    }
    if(data.url) {
        return data.url;
    }

    return extractText(data[0]);
}

export function* extractUrls(result) {
    if(!result.Items || ! result.Items.length) {
        return [];
    }

    const urls =  yield result.Items.filter(item => item.Name === 'URL' || item.Name === 'Avail')
    .map(item => function* () {
        let parsedItem = yield parseXML(item.Data);
        try {
            if (item.Name === 'Avail') {
                parsedItem = parsedItem[0].filter(item => item.url);
            }
            return {
                name: item.Label,
                url: extractText(parsedItem)
            };
        } catch (e) {
            return null;
        }
    });

    return urls.filter((item) => !!item);
}

export const extractFullTextLinks = defaultToEmptyArray(function extractFullTextLinks(result) {
    return result.FullText.CustomLinks
    .filter(({Category}) => Category === 'fullText')
    .map((link) => ({
        url: link.Url.replace(/&amp;/g, '&'),
        name: link.Text
    }));
});

export const extractPdfLinks = defaultToEmptyArray((result) => {
    return result.FullText.Links
    .filter(({ Type, Url }) => Type === 'pdflink' && !!Url)
    .map(({ Url }) => ({ url: Url }));
});

export const extractArticleLinks = function* extractArticleLinks(result) {
    return {
        fullTextLinks: extractFullTextLinks(result),
        pdfLinks: extractPdfLinks(result),
        urls: yield extractUrls(result)
    };
};

export default extractArticleLinks;
