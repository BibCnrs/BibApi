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
                OR: searchFields.map((searchField) =>
                    !searchField.field.includes('.')
                        ? {
                              [searchField.field]:
                                  searchField.mode === 'contains'
                                      ? {
                                            [searchField.mode]: search,
                                            mode: 'insensitive',
                                        }
                                      : {},
                          }
                        : {},
                ),
                ...filterQuery,
            };
        } else {
            if (key.includes('.')) {
                const isSearchable = searchFields.find(
                    (item) => item.field === key,
                );

                const [relation, field] = key.split('.');

                filterQuery = {
                    [relation]: {
                        some: {
                            [field]:
                                isSearchable.mode === 'contains'
                                    ? {
                                          [isSearchable.mode]: filters[key],
                                          mode: 'insensitive',
                                      }
                                    : {
                                          [isSearchable.mode]: filters[key],
                                      },
                        },
                    },
                    ...filterQuery,
                };
            } else if (key === 'id') {
                filterQuery = {
                    id: parseInt(filters[key]),
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
    }

    return filterQuery;
};
