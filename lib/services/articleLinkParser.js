import _ from 'lodash';
import request from 'request-promise';
import config from 'config';

import { defaultToEmptyArray } from '../utils/defaultTo';
import parseXML, { parseXMLArticle } from './parseXML';
import { extractTitle } from './articleParser';

export const getUrlFromUnpaywall = function* (unpaywallUrl, domain) {
    try {
        const doi = unpaywallUrl
            .replace('https://api.unpaywall.org/v2/doi=', '')
            .replace('?email=jjoly@ebsco.com', '');
        const query = `{GetByDOI(dois:["${doi}"]){is_oa, best_oa_location{ url_for_pdf }}}`;
        const result = yield request({
            method: 'POST',
            url: `${config.ez_unpaywall_url}/api/graphql?sid=bibapi`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': `${config.ez_unpaywall_key}`,
            },
            body: JSON.stringify({ query: query }),
        });
        const is_oa = JSON.parse(result).data.GetByDOI[0].is_oa;
        const url =
            JSON.parse(result).data.GetByDOI[0].best_oa_location.url_for_pdf;
        if (is_oa && url) {
            const urlEncoded = encodeURIComponent(url);
            return `${config.api_endpoint}/ebsco/oa?sid=unpaywall&doi=${doi}&url=${urlEncoded}&domaine=${domain}`;
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

    return extractText(data.find((data) => !!data.url));
}

export function* extractUrls(result, domain, isRetrieve) {
    const items =
        (result.Items &&
            result.Items.filter(
                (item) => item.Name === 'URL' || item.Name === 'Avail',
            )) ||
        [];

    const hasOpenAccessLink =
        result.FullText &&
        result.FullText.CustomLinks &&
        !!result.FullText.CustomLinks.find(
            (link) =>
                link.Category === 'fullText' &&
                /accès en ligne en open access/i.test(link.Text),
        );

    const unpaywalls =
        (!hasOpenAccessLink &&
            result.CustomLinks &&
            result.CustomLinks.filter(
                (link) =>
                    link.Category === 'other' &&
                    link.Url.includes('api.unpaywall'),
            )) ||
        [];

    if (!items.length === 0 && unpaywalls.length === 0) {
        return [];
    }

    const urls = yield items.map(
        (item) =>
            function* () {
                try {
                    let parsedItem = yield parseXML(item.Data);
                    if (Array.isArray(parsedItem)) {
                        parsedItem = _.flatten(parsedItem).filter(
                            (item) => typeof item === 'string' || !!item.url,
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
    );

    if (!isRetrieve) {
        urls.push(
            ...(yield unpaywalls.map(function* (link) {
                const unpaywallUrl = yield getUrlFromUnpaywall(
                    link.Url,
                    domain,
                );
                return {
                    name: link.Name,
                    url: unpaywallUrl
                        ? unpaywallUrl.replace('&amp;', '&')
                        : null,
                };
            }, {})),
        );
    }

    return urls.filter((item) => !!item && !!item.url);
}

export const extractFullTextLinks = defaultToEmptyArray(
    function extractFullTextLinks(result) {
        return result.FullText.CustomLinks.filter(
            ({ Category }) => Category === 'fullText',
        ).map((link) => ({
            url: cleanUrl(link.Url.replace(/&amp;/g, '&')),
            name: link.Text,
        }));
    },
);

export const extractPdfLinks = defaultToEmptyArray((result) => {
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
    isRetrieve = false,
) {
    return {
        fullTextLinks: extractFullTextLinks(result),
        pdfLinks: extractPdfLinks(result),
        html: extractHtml(result),
        urls: yield extractUrls(result, domain, isRetrieve),
    };
};

export default extractArticleLinks;
