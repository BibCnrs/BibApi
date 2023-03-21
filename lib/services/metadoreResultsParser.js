export default function (rawSearchResults) {
    const searchResults = JSON.parse(rawSearchResults);
    const size = searchResults.meta.size;
    const currentPage = searchResults.meta.currentPage;
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
        currentPage,
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
        subjects: result.attributes.subjects.map((subject) => subject.subject),
        publicationYear:
            result.attributes.publicationYear > new Date().getFullYear()
                ? ''
                : result.attributes.publicationYear,
        url: result.attributes.url,
    }));
};
