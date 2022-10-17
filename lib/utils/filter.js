export const transformFilters = function (filters, searchFields) {
    if (!filters) {
        return {};
    }

    let filterQuery = {};
    for (const key in filters) {
        if (filters[key] === '') {
            continue;
        }
        if (key === 'match') {
            if (!searchFields) {
                continue;
            }
            const search = filters[key];
            filterQuery = {
                OR: searchFields.map((searchField) => ({
                    [searchField.field]:
                        searchField.mode === 'contains'
                            ? {
                                  [searchField.mode]: search,
                                  mode: 'insensitive',
                              }
                            : {},
                })),
                ...filterQuery,
            };
        } else {
            const isSearchable = searchFields.find(
                (item) => item.field === key,
            );
            filterQuery = {
                ...filterQuery,
                [key]: {
                    [isSearchable.mode]: filters[key],
                },
            };
        }
    }

    return filterQuery;
};
