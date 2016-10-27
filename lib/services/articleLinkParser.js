import _ from 'lodash';

import { defaultToEmptyArray } from '../utils/defaultTo';
import parseXML, { parseXMLArticle } from './parseXML';
import { extractTitle } from './articleParser';

export function cleanUrl(url) {
    if(!url) {
        return url;
    }
    return url.match(/(http(s)?:.+)/)[0];
}

function extractText(data) {
    if(!data || typeof data === 'string') {
        return cleanUrl(data);
    }
    if(data.url) {
        return cleanUrl(data.url);
    }

    return extractText(data[0]);
}

export function* extractUrls(result) {
    if(!result.Items || ! result.Items.length) {
        return [];
    }

    const urls =  yield result.Items.filter(item => item.Name === 'URL' || item.Name === 'Avail')
    .map(item => function* () {
        try {
            let parsedItem = yield parseXML(item.Data);
            if (Array.isArray(parsedItem)) {
                parsedItem = _.flatten(parsedItem).filter(item => typeof item === 'string' || !!item.url);
            }

            return {
                name: item.Label,
                url: extractText(parsedItem)
            };
        } catch (e) {
            return null;
        }
    });

    return urls.filter((item) => !!item && !!item.url);
}

export const extractFullTextLinks = defaultToEmptyArray(function extractFullTextLinks(result) {
    return result.FullText.CustomLinks
    .filter(({Category}) => Category === 'fullText')
    .map((link) => ({
        url: cleanUrl(link.Url.replace(/&amp;/g, '&')),
        name: link.Text
    }));
});

export const extractPdfLinks = defaultToEmptyArray((result) => {
    return result.FullText.Links
    .filter(({ Type, Url }) => Type === 'pdflink' && !!Url)
    .map(({ Url }) => ({ url: cleanUrl(Url) }));
});

export function extractHtml(result) {
    if (
        !result.FullText ||
        !result.FullText.Text ||
        result.FullText.Text.Availability !== '1' ||
        !result.FullText.Text.Value
    ) {
        return null;
    }

    return parseXMLArticle(result.FullText.Text.Value, extractTitle(result));
}

export const extractArticleLinks = function* extractArticleLinks(result) {
    return {
        fullTextLinks: extractFullTextLinks(result),
        pdfLinks: extractPdfLinks(result),
        html: extractHtml(result),
        urls: yield extractUrls(result)
    };
};

export default extractArticleLinks;
