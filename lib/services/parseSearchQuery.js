export const addTruncature = term =>
    term
        .split(' ')
        .map(t => (t.match(/^[a-zA-Z]+$/) ? `${t}*` : t))
        .join(' ');

export const addTruncatureToQuery = ({ field, term, ...rest }) =>
    field === 'TI'
        ? { field, term: addTruncature(term), ...rest }
        : { field, term, ...rest };

export const parsePublicationQueries = rawQueries => {
    if (!rawQueries) {
        return {};
    }
    const queriesJson = JSON.parse(decodeURIComponent(rawQueries));
    if (queriesJson.length !== 1) {
        return { queries: queriesJson.map(addTruncatureToQuery) };
    }
    const { term, field } = queriesJson[0];

    if (field !== 'TI') {
        return {
            queries: queriesJson.map(addTruncatureToQuery),
        };
    }

    if (
        term.match(/[A-Z]\*$/) ||
        term === '0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*'
    ) {
        return {
            queries: [
                {
                    term: `JN (${term}) OR (TI (${term}) AND (PT book OR PT ebook))`,
                    field: null,
                    boolean: 'AND',
                },
            ],
            sort: 'title',
        };
    }

    return {
        queries: queriesJson.map(addTruncatureToQuery),
    };
};

export const parsePublicationSearch = rawQuery => ({
    ...rawQuery,
    activeFacets: rawQuery.activeFacets
        ? JSON.parse(decodeURIComponent(rawQuery.activeFacets))
        : null,
    ...parsePublicationQueries(rawQuery.queries),
});

export const parseArticleQueries = rawQueries => {
    if (!rawQueries) {
        return null;
    }
    const queriesJson = JSON.parse(decodeURIComponent(rawQueries));

    return queriesJson.map(addTruncatureToQuery);
};

export const parseArticleSearch = rawQuery => ({
    ...rawQuery,
    activeFacets: rawQuery.activeFacets
        ? JSON.parse(decodeURIComponent(rawQuery.activeFacets))
        : null,
    queries: parseArticleQueries(rawQuery.queries),
});
