// sort facet by alphabetical order, second argument is used for override first value
export function sortFacet(facet, overridenFirstValue) {
    facet.AvailableFacetValues.sort((a, b) => {
        return a.Value.localeCompare(b.Value);
    });

    const overrideIndex = facet.AvailableFacetValues.findIndex(
        (d) => d.Value === overridenFirstValue,
    );

    if (overrideIndex !== -1) {
        const [value] = facet.AvailableFacetValues.splice(overrideIndex, 1);
        facet.AvailableFacetValues.unshift(value);
    }

    return facet;
}
