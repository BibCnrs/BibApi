import parseArticleLinks from './parseArticleLinks';
import searchDataToString from './searchDataToString';

const getLinksText = (links) =>
    links.map(({ name, url }) => `${name} - ${url}`).join('\n');

const getRecordText = (record, gate) => {
    const { id, doi, title, publicationType, authors, source, articleLinks } =
        record;
    const type = publicationType ? `[${publicationType}]` : '';
    const links = parseArticleLinks(articleLinks, gate);

    return `${id}. ${title} ${type}

${
    authors
        ? authors.length > 5
            ? authors.slice(0, 5).join('; ').concat('...')
            : authors.join('; ')
        : ''
}

${source || ''} ${doi ? `DOI : ${doi}` : ''}

${links ? getLinksText(links) : `Pas d'accès pour cet article.`}`;
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

const getLimitersText = (limiters) => {
    const keys = Object.keys(limiters).filter((key) => !!limiters[key]);
    if (!keys.length) {
        return '';
    }

    return `Limites : ${searchDataToString(keys, limiters)}`;
};

const getFacetsText = (facets) => {
    const keys = Object.keys(facets).filter((key) => !!facets[key]);
    if (!keys.length) {
        return '';
    }

    return `Facettes : ${searchDataToString(keys, facets)}`;
};

export default (records, gate, queries, domain, limiters, activeFacets) => {
    return `${
        records.length
    } nouveau(x) résultat(s) est(sont) disponible(s) concernant votre recherche :

Termes recherchés :
    ${queries
        .map((q) => `${fieldLabel[q.field] || q.field}: ${q.term}`)
        .join(', ')}

Domaine :
    ${domain}

${getLimitersText(limiters)}

${getFacetsText(activeFacets)}

${records.map((record) => getRecordText(record, gate)).join('\n\n')}`;
};
