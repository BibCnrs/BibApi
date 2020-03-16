import _ from 'lodash';
import parseArticleLinks from './parseArticleLinks';
import searchDataToString from './searchDataToString';

const HAL_REGEX = /https?:\/\/(?:www\.)?(hal|tel)(shs)?(-.*)?\.(.*)\.(.*)/;

function OALink({ url, name }) {
    let OA = false;

    if (/open access/i.test(name) || HAL_REGEX.test(url)) {
        OA = true;
    }

    return {
        url,
        OA,
    };
}

const getRecordHtml = function*(record, gate) {
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

    let oaLink = null;
    // get url for title
    let [accessUrl] = _.remove(links, link => /open access/i.test(link.name));
    if (!accessUrl) {
        [accessUrl] = _.remove(links, link => /unpaywalleds/i.test(link.name));
        if (accessUrl) {
            const [, url] = accessUrl.url.match(/url=(.*)&/);
            if (url) {
                oaLink = {
                    url,
                    OA: true,
                };
            }
        }
    }
    if (!oaLink) {
        if (!accessUrl) {
            [accessUrl] = _.remove(links, link =>
                /url d'accès|access url|online access/i.test(link.name),
            );
        }
        if (!accessUrl) {
            [accessUrl] = _.remove(links, link =>
                /disponibilite|availability/i.test(link.name),
            );
        }
        if (!accessUrl) {
            [accessUrl] = _.remove(links, { name: 'Accès au pdf' });
        }

        if (accessUrl) {
            oaLink = OALink({
                url: accessUrl.url,
                name: accessUrl.name,
            });
        } else if (links && links.length > 0) {
            oaLink = {
                url: links[0].url,
            };
        }
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
                                : `${id}. ${title} ${type} - Pas d'accès pour cette article`
                        }
                        ${
                            oaLink && oaLink.OA === true
                                ? `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAATCAMAAACX3symAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABvFBMVEUBAQEAAAAVDApCKCJHKyRIKyU1Ih4TEhIAAABDKCI6OjoAAABILCVDQ0MAAAAAAABIKyVXV1cFBQUAAAA2NzcICQk4KCVILCVKLCVMLSZJLCVKLCVMLSZHKyVEKSNDKCIVDQsVDQvni3b0knzzknz3lH6oZldbWlr0k33/moP/mYL/nIWoZFSFhITR0dH/nISnY1T////e3t7/m4S1bFtXVFSipKSkpaWLjIyiYVOJUkaKU0eLVEicaFz/moLzk330k3z5l4HZiHrShXjylH/9mILkjXz+mYLljHluWWMgNlIeNlJKSVvYiHr/m4Pei3s0P1Y4QVfijXz1k3yTZ2cSL0+ZbGy6enMmOFNjVGCkcW4oOVMkN1KqdHD3lH1YTVo3QFfylYD/nINvWWMtO1TskX5gUmBnVmFZUF5lVWFUS1o6Qlj0lYBzW2QsO1QpOlRXTl5NSlvdiHeIYmUVMU+1eHLWh3kxPVVbUF6tdXATME9JSFtGR1qsc21TTV0cNFEhN1IxPlbKgnd2XGVARFnxk3/pj31wWGDwk3+8e3Oyd3HUhnnVh3nShXnKgHPoi3b1k31EKSJJLCVDKCJts5qpAAAAInRSTlMAAM39/f3+vyz9zj/+4lYC/u1nBPB99v3+/v79/f39/M/Or/y3gAAAAAFiS0dEMdnbHXIAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfkAwYMFigD/TJxAAAA+UlEQVQY02NgYmYBAlY2dg4GRkZGBk4lZRUVFVU1dS5uEJdHQ1NLS0tbR1ePl4+fkUFAGcjT0jfQNTQSFBKGco1NTM3MLUREoVwtFUsraxtbMSDXThOk21hfX99enEHAwdHJ2cVOy9XNzV2ZlUHCw9PL28fXzz8gMCiYlUEyJDQsPCLSLio6JjaOlUEqPiExKTklNS09I1MFyM3KzvHLzXPOLyjMK5JmkCwuKS0rr6isqq4JrZVhkCiqq29obGpuaW0LaJdmENDo6OwKcu/ucXft7ZMFOkPTz89OC+QUP3tWqI/AQBNoslz/BGUomNAvz6AwcRIcTFYEAJA4QQz/A1ALAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIwLTAzLTA2VDExOjIyOjQwKzAxOjAw3K2xLwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMC0wMy0wNlQxMToyMjo0MCswMTowMK3wCZMAAAAASUVORK5CYII=" alt="open access icon" />`
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
                                    <span style="background-color: #f8f8f8; box-sizing: border-box;">${source ||
                                        ''}</span> ${doi ? `DOI : ${doi}` : ''}
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

export default function*(
    records,
    gate,
    queries,
    domain,
    limiters,
    activeFacets,
) {
    const elements = [];
    for (const record of records) {
        elements.push(yield getRecordHtml(record, gate));
    }
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
                ${elements.join('')}
            </tbody>
        </table>
    </div>`;
}
