const displayTerm = {
    fullText: 'Texte intégral',
    peerReviewedArticle: 'Relu par un comité de lecture',
    publicationDate: 'Date de publication',
    Journal: 'Journal',
    SubjectEDS: 'Mots clé',
    Publisher: 'Editeur',
    Publication: 'Publication',
    Language: 'Langue',
    Category: 'Categorie',
    ContentProvider: 'Fournisseur de contenu',
};

const getDisplay = (key, value) => {
    if (value === null || typeof value === 'undefined') {
        return;
    }
    switch (key) {
        case 'fullText':
            return displayTerm[key];
        case 'peerReviewedArticle':
            return displayTerm[key];
        case 'publicationDate':
            if (!value.from || !value.to) {
                return;
            }
            return `${displayTerm[key]}: ${value.from}/${value.to}`;
        case 'Journal':
            return `${displayTerm[key]}: ${value}`;
        case 'SourceType':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'SubjectEDS':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'Publisher':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'Publication':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'Language':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'Category':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        case 'ContentProvider':
            return `${displayTerm[key]}: ${value.join(', ')}`;
        default:
            return key + JSON.stringify(value);
    }
};

export default (keys, data) => {
    return keys
        .map((key) => {
            return getDisplay(key, data[key]);
        })
        .filter((v) => !!v)
        .join('; ');
};
