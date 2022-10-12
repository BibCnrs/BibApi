import config from 'config';
import _ from 'lodash';
import parseArticleLinks from './parseArticleLinks';
import searchDataToString from './searchDataToString';

const HAL_REGEX = /https?:\/\/(?:www\.)?(hal|tel)(shs)?(-.*)?\.(.*)\.(.*)/;
const EXTRACT_DOI_REGEX = /https?:\/\/(?:www\.)?(?:.*)?\.doi\.org\/(.*)/;

const guessSid = (url) => {
    if (url.indexOf('http://arxiv.org') === 0) {
        return 'arxiv';
    }

    if (url.indexOf('https://doaj.org') === 0) {
        return 'doaj';
    }

    if (HAL_REGEX.test(url)) {
        return 'hal';
    }

    return null;
};

function proxify(apiUrl, url, doi, domain, name, user_id) {
    if (!url) {
        return null;
    }
    let sid = guessSid(url);

    if (!sid) {
        if (/open access/i.test(name)) {
            sid = 'oa';
        } else {
            return url;
        }
    }

    return `${apiUrl}/oa_database?url=${encodeURIComponent(
        url,
    )}&sid=${sid}&domaine=${domain}&doi=${doi}&user_id=${user_id}`;
}

function OALink({ apiUrl, url, doi, domain, name, user_id }) {
    let normalizedDoi = typeof doi === 'string' ? doi : null;
    let OA = false;
    if (Array.isArray(doi)) {
        const { url } = _.flattenDeep(doi)[0];

        if (url) {
            normalizedDoi = url.match(EXTRACT_DOI_REGEX)[1];
        }
    }

    if (/open access/i.test(name) || HAL_REGEX.test(url)) {
        OA = true;
    }

    return {
        url: proxify(apiUrl, url, normalizedDoi, domain, name, user_id),
        OA,
    };
}

const getRecordHtml = function* (record, gate, user_id) {
    const { id, doi, title, publicationType, authors, source, articleLinks } =
        record;
    const type = publicationType ? `[${publicationType}]` : '';
    const links = parseArticleLinks(articleLinks, gate);

    let oaLink = null;
    // get url for title
    let [accessUrl] = _.remove(links, (link) => /open access/i.test(link.name));
    if (!accessUrl) {
        [accessUrl] = _.remove(links, (link) =>
            /unpaywalleds/i.test(link.name),
        );
    }
    if (!oaLink) {
        if (!accessUrl) {
            [accessUrl] = _.remove(links, (link) =>
                /texte intégral/i.test(link.name),
            );
        }
        if (!accessUrl) {
            [accessUrl] = _.remove(links, (link) =>
                /url d'accès|access url|online access/i.test(link.name),
            );
        }
        if (!accessUrl) {
            [accessUrl] = _.remove(links, (link) =>
                /disponibilite|availability/i.test(link.name),
            );
        }
        if (!accessUrl) {
            [accessUrl] = _.remove(links, { name: 'Accès au pdf' });
        }

        if (accessUrl) {
            oaLink = OALink({
                apiUrl: `${config.api_endpoint}/ebsco`,
                url: accessUrl.url,
                doi,
                domain: gate,
                name: accessUrl.name,
                user_id,
            });
        } else if (links && links.length > 0) {
            oaLink = {
                url: links[0].url,
            };
        }
    }

    // format oa link already formatted
    if (
        oaLink &&
        oaLink.url &&
        oaLink.url.includes('ebsco/oa?') &&
        oaLink.url.includes('sid=unpaywall')
    ) {
        oaLink = {
            url: `${oaLink.url.replace(
                'ebsco/oa?',
                'ebsco/oa_database?',
            )}&user_id=${user_id}`,
            OA: true,
        };
    }

    return `<tr style="box-sizing: border-box; font-size: 13px; line-height: 1em;">
            <td class="record" style="box-sizing: border-box; margin: 0px 20px 20px; padding: 5px 20px 5px 20px;">
                <div style="background-color: #f8f8f8; padding: 5px 20px 20px;">
                    <h4 class="title">
                        ${
                            oaLink
                                ? `<a href="${oaLink.url}" style="
                                text-decoration: none;
                                background-color: #f8f8f8;
                                box-sizing: border-box;
                                font-family: inherit;
                                font-weight: 500;
                                line-height: 1.1;
                                margin-top: 10px;
                                margin-bottom: 10px;
                                font-size: 18px;
                                color: #337ab7;">
                                ${id}. ${title} ${type}</a>`
                                : `${id}. ${title} ${type} - Pas d'accès pour cet article`
                        }
                        ${
                            oaLink && oaLink.OA === true
                                ? `<span style="background-color: #FB9A83; color: #337ab7; padding: 2.5px;">
                                    OA
                                </span>`
                                : ''
                        }
                    </h4>
                    <span style="background-color: #f8f8f8; box-sizing: border-box;">
                        <div style="background-color: #f8f8f8; box-sizing: border-box;">
                            <div style="background-color: #f8f8f8; box-sizing: border-box;">
                                <p style="background-color: #f8f8f8; box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">
                                    <span style="background-color: #f8f8f8; box-sizing: border-box;">
                                        ${
                                            authors
                                                ? authors.length > 5
                                                    ? authors
                                                          .slice(0, 5)
                                                          .join('; ')
                                                          .concat('...')
                                                    : authors.join('; ')
                                                : ''
                                        }
                                    </span>
                                </p>
                                <p style="background-color: #f8f8f8; box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">
                                    <span style="background-color: #f8f8f8; box-sizing: border-box;">${
                                        source || ''
                                    }</span> ${doi ? `DOI : ${doi}` : ''}
                                </p>
                            </div>
                        </div>
                    </span>
                </div>
            </td>
        </tr>`;
};

const fieldLabel = {
    [null]: 'Tout',
    AU: 'Auteur',
    AR: 'Auteur exact',
    TI: 'Titre',
    SU: 'Sujet',
    SO: 'Source',
    AB: 'Résumé',
    IS: 'ISSN',
    IB: 'ISBN',
    PB: 'Editeur',
};

const getLimitersHtml = (limiters) => {
    const keys = Object.keys(limiters).filter((key) => !!limiters[key]);
    if (!keys.length) {
        return '';
    }

    return `<dt style="font-weight: bold;">Limites</dt>
    <dd style="flex: 9;">${searchDataToString(keys, limiters)}</dd>`;
};

const getFacetsHtml = (facets) => {
    const keys = Object.keys(facets).filter((key) => !!facets[key]);
    if (!keys.length) {
        return '';
    }

    return `<dt style="font-weight: bold;">Facettes</dt>
    <dd style="flex: 9;">${searchDataToString(keys, facets)}</dd>`;
};

export default function* (
    records,
    gate,
    queries,
    domain,
    limiters,
    activeFacets,
    user_id,
) {
    const elements = [];
    for (const record of records) {
        elements.push(yield getRecordHtml(record, gate, user_id));
    }
    return `<div  style="box-sizing: border-box;">
        <p>${
            records.length
        } nouveau(x) résultat(s) est(sont) disponible(s) concernant votre recherche : </p>
        <dl style="display: flex; flex-direction: column; margin: 0px 20px 20px; padding: 5px 20px 5px 20px;">
            <dt style="font-weight: bold;">Termes recherchés :</dt>
            <dd style="flex: 9;">${queries
                .map((q) => `${fieldLabel[q.field] || q.field}: ${q.term}`)
                .join(', ')}</dd>
            <dt style="font-weight: bold;">Domaine</dt>
            <dd style="flex: 9;">${domain}</dd>
            ${getLimitersHtml(limiters)}
            ${getFacetsHtml(activeFacets)}
        </dl>
        <table class="record_list" style="box-sizing: border-box; margin-top: 0; border-collapse: collapse;">
            <tbody>
                ${elements.join('')}
            </tbody>
        </table>
    </div>`;
}
