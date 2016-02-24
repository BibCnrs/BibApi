export function parse(rawActiveFacets) {
    return rawActiveFacets
    .reduce((result, activeFacet) => {
        return [
            ...result,
            ...activeFacet.FacetValues
        ];
    }, [])
    .reduce((result, facetValue) => {
        const values = result[facetValue.Id] || [];
        return {
            ...result,
            [facetValue.Id]: [
                ...values,
                facetValue.Value
            ]
        };
    }, {});
}

export function unparse(activeFacets) {
    return Object.keys(activeFacets).map((key, index) => {
        return {
            FilterId: index + 1,
            FacetValues: activeFacets[key].map(facetValue => {
                return {
                    Id: key,
                    Value: facetValue
                };
            })
        };
    });
}
