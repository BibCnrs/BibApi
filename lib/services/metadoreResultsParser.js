export default function (rawSearchResults, query) {
    const size = query.size;
    const currentPage = parseInt(query.currentPage) || 1;
    const searchResults = JSON.parse(rawSearchResults);
    if (searchResults.meta.total === 0) {
        return {
            results: [],
            totalHits: 0,
            maxPage: 1,
            next: null,
            currentPage,
        };
    }

    return {
        results: parseResultsData(searchResults.data, size, currentPage),
        totalHits: searchResults.meta.total,
        maxPage: searchResults.meta.totalPages,
        next: searchResults.links.next,
        currentPage,
    };
}

const parseResultsData = (data, size, currentPage) => {
    return data.map((result, index) => ({
        id: (currentPage - 1) * size + index + 1,
        type:
            result.attributes.types.resourceType ||
            result.attributes.types.resourceTypeGeneral,
        title: result.attributes.titles[0].title,
        description: result.attributes.descriptions[0]
            ? result.attributes.descriptions[0].description
            : '',
        url: result.attributes.url,
    }));
};
