import { mailServer } from 'config';

const text = {
    fullTextLinks: "Accès à l'article",
    pdfLinks: 'Accès au pdf',
    urls: 'Urls',
    html: 'html',
    noLinks: "Pas d'accès pour cet article.",
    linksLoading: 'Chargement des liens',
    'Access URL': "URL d'accès",
    'Other URLs': 'Autres URLs',
    Availability: 'Disponibilité',
};

const parseArticleLinks = (articleLinks, currentGate) => {
    const { fullTextLinks = [], pdfLinks = [], urls = [], html } = articleLinks;

    if (
        (!fullTextLinks || !fullTextLinks.length) &&
        (!pdfLinks || !pdfLinks.length) &&
        (!urls || !urls.length) &&
        !html
    ) {
        return null;
    }
    const htmlLists = html
        ? [
              {
                  name: 'html',
                  icon: 'file-code-o',
                  url:
                      'data:text/html;charset=utf-8,' +
                      encodeURIComponent(html),
                  download: true,
              },
          ]
        : [];

    return []
        .concat(fullTextLinks.map(link => ({ ...link, icon: 'th-list' })))
        .concat(
            pdfLinks.map(({ url }) => ({
                url: url.match(currentGate)
                    ? url
                    : `http://${currentGate}.bib.cnrs.fr/login?url=${url}`,
                name: text.pdfLinks,
                icon: 'file-pdf-o',
            })),
        )
        .concat(
            urls.map(link => ({
                ...link,
                name: text[link.name] || link.name,
                icon: 'link',
            })),
        )
        .concat(htmlLists);
};

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

    return `<li>
            <div class="record">
                <h4 class="title">
                    ${id}. ${title} ${type}
                </h4>
                <span>
                    <div>
                        <div>
                            <p>
                                <span>
                                    ${authors ? authors.join('; ') : ''}
                                </span>
                            </p>
                            <p>
                                <span>${source || ''}</span> ${
        doi ? `DOI : ${doi}` : ''
    }
                            </p>
                            <div class="article-link">
                                <ul>
                                    ${
                                        links
                                            ? links.map(
                                                  ({
                                                      name,
                                                      icon,
                                                      url,
                                                      download,
                                                  }) =>
                                                      `<li>
                                                <a
                                                    href=${url}
                                                    target="blank"
                                                    ${
                                                        download
                                                            ? 'download'
                                                            : ''
                                                    }
                                                >
                                                    <span class="fa fa-${icon}"> ${name}
                                                </a>
                                            </li>`,
                                              )
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

const getSearchAlertMailHtml = (records, gate) => {
    return `<div>
        <ul class="record_list">
            ${records.map(record => getRecordHtml(record, gate))}
        </ul>
    </div>`;
};

export default (records, gate, mail) => {
    return {
        from: mailServer.from,
        to: mail,
        subject: `Alerte : Nouveaux résultats pour votre alerte`,
        html: getSearchAlertMailHtml(records, gate),
    };
};
