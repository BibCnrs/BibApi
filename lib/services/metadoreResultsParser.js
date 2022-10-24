export default function (rawSearchResults) {
    const searchResults = JSON.parse(rawSearchResults);
    const size = searchResults.meta.size;
    const currentPage = searchResults.meta.currentPage + 1;
    if (searchResults.meta.total === 0) {
        return {
            results: [],
            totalHits: 0,
            maxPage: 1,
            currentPage,
        };
    }

    return {
        results: parseResultsData(searchResults.data, size, currentPage),
        totalHits: searchResults.meta.total,
        maxPage: searchResults.meta.totalPages,
        currentPage: searchResults.meta.currentPage + 1, // Metadore API starts at 0
    };
}

const parseResultsData = (data, size, currentPage) => {
    return data.map((result, index) => ({
        id: (currentPage - 1) * size + index + 1,
        doi: result.attributes.doi,
        type:
            result.attributes.types.resourceType ||
            result.attributes.types.resourceTypeGeneral,
        titles: result.attributes.titles,
        descriptions: result.attributes.descriptions,
        url: result.attributes.url,
    }));
};
