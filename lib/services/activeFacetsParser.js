export const parseFacetValue = (facetValue) => {
    return {
        value: facetValue.FacetValue.Value,
        action: facetValue.RemoveAction
    };
};

export const parseFacetFilter = (facetFilter) => {
    return {
        name: facetFilter.FacetValuesWithAction[0].FacetValue.Id,
        action: facetFilter.RemoveAction,
        values: facetFilter.FacetValuesWithAction.map(parseFacetValue)
    };
};

export default function activeFacetsParser(facetFilters = []) {
    return facetFilters.map(parseFacetFilter);
}
