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

export default (articleLinks, currentGate) => {
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
                  url:
                      'data:text/html;charset=utf-8,' +
                      encodeURIComponent(html),
                  download: true,
              },
          ]
        : [];

    return []
        .concat(
            fullTextLinks.map((link) => ({
                ...link,
                icon: 'th-list',
            })),
        )
        .concat(
            pdfLinks.map(({ url }) => ({
                url: url.match(currentGate)
                    ? url
                    : `http://${currentGate}.bib.cnrs.fr/login?url=${url}`,
                name: text.pdfLinks,
            })),
        )
        .concat(
            urls.map((link) => ({
                ...link,
                name: text[link.name] || link.name,
            })),
        )
        .concat(htmlLists);
};
