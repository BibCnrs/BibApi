import parseArticleLinks from './parseArticleLinks';
import searchDataToString from './searchDataToString';

const getLinksHtml = links =>
    links
        .map(({ name, url, download }) => {
            let link = '';
            if (name === 'html') {
                link = `Document disponible via le portail <a href="https://bib.cnrs.fr/">BibCnrs</a>`;
            } else {
                link = `<a
                style="background-color: #f8f8f8; box-sizing: border-box;background-color: transparent;color: #337ab7;"
                href=${url}
                target="blank"
                ${download ? 'download' : ''}
                >
                ${name}
                </a>`;
            }
            return `<tr style="background-color: #f8f8f8; box-sizing: border-box;">
                <td style="background-color: #f8f8f8;">
                ${link}
                </td>
            </tr>`;
        })
        .join('');

const getRecordHtml = (record, gate) => {
    const {
        id,
        doi,
        title,
        publicationType,
        authors,
        source,
        articleLinks,
    } = record;
    const type = publicationType ? `[${publicationType}]` : '';
    const links = parseArticleLinks(articleLinks, gate);

    return `<tr style="box-sizing: border-box; font-size: 13px; line-height: 1em;">
            <td class="record" style="box-sizing: border-box; margin: 0px 20px 20px; padding: 5px 20px 5px 20px;">
                <div style="background-color: #f8f8f8; padding: 5px 20px 20px;">
                    <h4 class="title" style="background-color: #f8f8f8; box-sizing: border-box;font-family: inherit;font-weight: 500;line-height: 1.1;color: inherit;margin-top: 10px;margin-bottom: 10px;font-size: 18px; color: #337ab7;">
                        ${id}. ${title} ${type}
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
                                    <span style="background-color: #f8f8f8; box-sizing: border-box;">${source ||
                                        ''}</span> ${doi ? `DOI : ${doi}` : ''}
                                </p>
                                <div class="article-link" style="background-color: #f8f8f8; box-sizing: border-box;">
                                    <table style="background-color: #f8f8f8; box-sizing: border-box;margin-top: 0;margin-bottom: 0; list-style: none;">
                                        ${
                                            links
                                                ? getLinksHtml(links)
                                                : `Pas d'accès pour cet article.`
                                        }
                                    </table>
                                </div>
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

const getLimitersHtml = limiters => {
    const keys = Object.keys(limiters).filter(key => !!limiters[key]);
    if (!keys.length) {
        return '';
    }

    return `<dt style="font-weight: bold;">Limites</dt>
    <dd style="flex: 9;">${searchDataToString(keys, limiters)}</dd>`;
};

const getFacetsHtml = facets => {
    const keys = Object.keys(facets).filter(key => !!facets[key]);
    if (!keys.length) {
        return '';
    }

    return `<dt style="font-weight: bold;">Facettes</dt>
    <dd style="flex: 9;">${searchDataToString(keys, facets)}</dd>`;
};

export default (records, gate, queries, domain, limiters, activeFacets) => {
    return `<div  style="box-sizing: border-box;">
        <p>${
            records.length
        } nouveau(x) résultat(s) est(sont) disponible(s) concernant votre recherche : </p>
        <dl style="display: flex; flex-direction: column; margin: 0px 20px 20px; padding: 5px 20px 5px 20px;">
            <dt style="font-weight: bold;">Termes recherchés :</dt>
            <dd style="flex: 9;">${queries
                .map(q => `${fieldLabel[q.field] || q.field}: ${q.term}`)
                .join(', ')}</dd>
            <dt style="font-weight: bold;">Domaine</dt>
            <dd style="flex: 9;">${domain}</dd>
            ${getLimitersHtml(limiters)}
            ${getFacetsHtml(activeFacets)}
        </dl>
        <table class="record_list" style="box-sizing: border-box; margin-top: 0; border-collapse: collapse;">
            <tbody>
                ${records.map(record => getRecordHtml(record, gate)).join('')}
            </tbody>
        </table>
    </div>`;
};
