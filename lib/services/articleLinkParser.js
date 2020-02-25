import _ from 'lodash';
import request from 'request-promise';
import config from 'config';

import { defaultToEmptyArray } from '../utils/defaultTo';
import parseXML, { parseXMLArticle } from './parseXML';
import { extractTitle } from './articleParser';

export const getUrlFromUnpaywall = function*(unpaywallUrl, domain) {
    try {
        const result = yield request({
            method: 'GET',
            url: unpaywallUrl,
        });

        const { best_oa_location: urlLocation, doi } = JSON.parse(result);
        if (urlLocation) {
            const url =
                urlLocation.url_for_pdf || urlLocation.url_for_landing_page;
            return `${config.api_endpoint}/ebsco/oa?sid=unpaywall&doi=${doi}&url=${url}&domaine=${domain}`;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export function cleanUrl(url) {
    if (!url) {
        return url;
    }

    const match = url.match(/(http(s)?:.+)/);
    return match ? match[0] : null;
}

function extractText(data) {
    if (!data || typeof data === 'string') {
        return cleanUrl(data);
    }
    if (data.url) {
        return cleanUrl(data.url);
    }

    if (data.length === 1) {
        return extractText(data[0]);
    }

    return extractText(data.find(data => !!data.url));
}

export function* extractUrls(result, domain) {
    const items =
        (result.Items &&
            result.Items.filter(
                item => item.Name === 'URL' || item.Name === 'Avail',
            )) ||
        [];
    const hasOpenAccessLink =
        result.FullText &&
        result.FullText.CustomLinks &&
        !!result.FullText.CustomLinks.find(
            link =>
                link.Category === 'fullText' &&
                /accès en ligne en open access/i.test(link.Text),
        );

    const unpaywalls =
        (!hasOpenAccessLink &&
            result.CustomLinks &&
            result.CustomLinks.filter(
                link =>
                    link.Category === 'other' &&
                    link.Url.includes('api.unpaywall'),
            )) ||
        [];

    if (!items.length === 0 && unpaywalls.length === 0) {
        return [];
    }

    const urls = [
        ...(yield items.map(
            item =>
                function*() {
                    try {
                        let parsedItem = yield parseXML(item.Data);
                        if (Array.isArray(parsedItem)) {
                            parsedItem = _.flatten(parsedItem).filter(
                                item => typeof item === 'string' || !!item.url,
                            );
                        }

                        return {
                            name: item.Label,
                            url: extractText(parsedItem),
                        };
                    } catch (e) {
                        return null;
                    }
                },
        )),
        ...(yield unpaywalls.map(function*(link) {
            const unpaywallUrl = yield getUrlFromUnpaywall(link.Url, domain);
            return {
                name: link.Name,
                url: unpaywallUrl ? unpaywallUrl.replace('&amp;', '&') : null,
            };
        }, {})),
    ];

    return urls.filter(item => !!item && !!item.url);
}

export const extractFullTextLinks = defaultToEmptyArray(
    function extractFullTextLinks(result) {
        return result.FullText.CustomLinks.filter(
            ({ Category }) => Category === 'fullText',
        ).map(link => ({
            url: cleanUrl(link.Url.replace(/&amp;/g, '&')),
            name: link.Text,
        }));
    },
);

export const extractPdfLinks = defaultToEmptyArray(result => {
    return result.FullText.Links.filter(
        ({ Type, Url }) => Type === 'pdflink' && !!Url,
    ).map(({ Url }) => ({ url: cleanUrl(Url) }));
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

export const extractArticleLinks = function* extractArticleLinks(
    result,
    domain,
) {
    return {
        fullTextLinks: extractFullTextLinks(result),
        pdfLinks: extractPdfLinks(result),
        html: extractHtml(result),
        urls: yield extractUrls(result, domain),
    };
};

export default extractArticleLinks;
