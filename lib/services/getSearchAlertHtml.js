import parseArticleLinks from './parseArticleLinks';
import searchDataToString from './searchDataToString';

const getLinksHtml = links =>
    links
        .map(
            ({ name, url, download }) =>
                `<li style="box-sizing: border-box;">
<a
  style="box-sizing: border-box;background-color: transparent;color: #337ab7;"
  href=${url}
  target="blank"
  ${download ? 'download' : ''}
>
  ${name}
</a>
</li>`,
        )
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

    return `<li style="box-sizing: border-box; background-color: #f8f8f8; margin: 0px 20px 20px; padding: 5px 20px 5px 20px; font-size: 13px; line-height: 1em;">
            <div class="record" style="box-sizing: border-box;">
                <h4 class="title" style="box-sizing: border-box;font-family: inherit;font-weight: 500;line-height: 1.1;color: inherit;margin-top: 10px;margin-bottom: 10px;font-size: 18px; color: #337ab7;">
                    ${id}. ${title} ${type}
                </h4>
                <span style="box-sizing: border-box;">
                    <div style="box-sizing: border-box;">
                        <div style="box-sizing: border-box;">
                            <p style="box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">
                                <span style="box-sizing: border-box;">
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
                            <p style="box-sizing: border-box;orphans: 3;widows: 3;margin: 0 0 10px;">
                                <span style="box-sizing: border-box;">${source ||
                                    ''}</span> ${doi ? `DOI : ${doi}` : ''}
                            </p>
                            <div class="article-link" style="box-sizing: border-box;">
                                <ul style="box-sizing: border-box;margin-top: 0;margin-bottom: 0; list-style: none;">
                                    ${
                                        links
                                            ? getLinksHtml(links)
                                            : `Pas d'accès pour cet article.`
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </span>
            </div>
        </li>`;
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
        } nouveaux résultats sont disponibles concernant votre recherche : </p>
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
        <ul class="record_list" style="box-sizing: border-box;margin-top: 0;margin-bottom: 10px; list-style-type: none;">
            ${records.map(record => getRecordHtml(record, gate)).join('')}
        </ul>
    </div>`;
};
