export function parse(rawActiveFacets) {
    if (!rawActiveFacets) {
        return {};
    }

    const activeFacetValues = rawActiveFacets.reduce((result, activeFacet) => {
        return [...result, ...activeFacet.FacetValues];
    }, []);

    return activeFacetValues.reduce((result, facetValue) => {
        const values = result[facetValue.Id] || [];
        return {
            ...result,
            [facetValue.Id]: [...values, facetValue.Value],
        };
    }, {});
}

export function unparse(activeFacets) {
    return Object.keys(activeFacets).map((key, index) => {
        return {
            FilterId: index + 1,
            FacetValues: activeFacets[key].map((facetValue) => {
                return {
                    Id: key,
                    Value: facetValue,
                };
            }),
        };
    });
}
