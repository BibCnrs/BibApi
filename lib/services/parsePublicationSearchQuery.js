export const parseQueries = rawQueries => {
    if (!rawQueries) {
        return {};
    }
    const queriesJson = JSON.parse(decodeURIComponent(rawQueries));
    if (queriesJson.length !== 1) {
        return { queries: queriesJson };
    }
    const { term, field } = queriesJson[0];

    if (field !== 'TI') {
        return { queries: queriesJson };
    }

    if (term.match(/[A-Z]\*$/)) {
        return {
            queries: [{
                term: `JN ${term} OR (TI (${term}) AND (PT book OR PT ebook))`,
                field: null,
                boolean: 'AND',
            }],
            sort: 'title',
        };
    }

    if (term === '0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9*') {
        return {
            queries: [{
                term: `JN (${term}) OR (TI (${term}) AND (PT book OR PT ebook))`,
                field: null,
                boolean: 'AND',
            }],
            sort: 'title',
        };
    }

    return queriesJson;
};

export default (rawQuery) => ({
    ...rawQuery,
    activeFacets: rawQuery.activeFacets ? JSON.parse(decodeURIComponent(rawQuery.activeFacets)) : null,
    ...parseQueries(rawQuery.queries),
});
