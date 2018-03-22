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
        authors = [],
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
                                        (authors || []).length > 5
                                            ? authors
                                                  .slice(0, 5)
                                                  .join('; ')
                                                  .concat('...')
                                            : authors.join('; ')
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
                                            ? links
                                                  .map(
                                                      ({
                                                          name,
                                                          url,
                                                          download,
                                                      }) =>
                                                          `<li style="box-sizing: border-box;">
                                                <a
                                                    style="box-sizing: border-box;background-color: transparent;color: #337ab7;"
                                                    href=${url}
                                                    target="blank"
                                                    ${
                                                        download
                                                            ? 'download'
                                                            : ''
                                                    }
                                                >
                                                    ${name}
                                                </a>
                                            </li>`,
                                                  )
                                                  .join('')
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
    return `<div  style="box-sizing: border-box;">
        <ul class="record_list" style="box-sizing: border-box;margin-top: 0;margin-bottom: 10px; list-style-type: none;
        ">
            ${records.map(record => getRecordHtml(record, gate)).join('')}
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
