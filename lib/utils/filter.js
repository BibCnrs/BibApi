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
            filterQuery = filterMatch(key, filterQuery, filters, searchFields);
        } else {
            filterQuery = filterByType(key, filterQuery, filters, searchFields);
        }
    }

    return filterQuery;
};

const filterMatch = (key, filterQuery, filters, searchFields) => {
    let matchQuery = {};
    const orQuery = [];
    for (const searchField of searchFields) {
        const field = searchField.field;
        const mode = searchField.mode;
        const excludeMatch = searchField.excludeMatch || false;
        const value = filters[key];

        if (excludeMatch) {
            continue;
        }

        if (mode === 'lte' || mode === 'gte' || field.includes('.')) {
            continue;
        }

        const orFilter = filterByType(
            field,
            matchQuery,
            { [field]: value },
            searchFields,
        );
        orQuery.push(orFilter);
    }

    return {
        OR: orQuery,
        ...filterQuery,
    };
};
const filterByType = (key, filterQuery, filters, searchFields) => {
    if (key.includes('.')) {
        filterQuery = filterRelation(key, filterQuery, filters, searchFields);
    } else if (key.includes('_lte')) {
        filterQuery = filterLte(key, filterQuery, filters);
    } else if (key.includes('_gte')) {
        filterQuery = filterGte(key, filterQuery, filters);
    } else if (key === 'id') {
        filterQuery = filterId(key, filterQuery, filters);
    } else {
        filterQuery = filterDefault(key, filterQuery, filters, searchFields);
    }

    return filterQuery;
};

const filterRelation = (key, filterQuery, filters, searchFields) => {
    const isSearchable = searchFields.find((item) => item.field === key);

    const [relation, field] = key.split('.');

    return {
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
};

const filterLte = (key, filterQuery, filters) => {
    if (new Date(filters[key]) > new Date('9999-12-31')) {
        return filterQuery;
    }

    const field = key.replace('_lte', '');
    return {
        [field]: {
            lte: new Date(filters[key]),
        },
        ...filterQuery,
    };
};

const filterGte = (key, filterQuery, filters) => {
    if (new Date(filters[key]) > new Date('9999-12-31')) {
        return filterQuery;
    }

    const field = key.replace('_gte', '');
    return {
        [field]: {
            gte: new Date(filters[key]),
        },
        ...filterQuery,
    };
};

const filterId = (key, filterQuery, filters) => {
    return {
        id: parseInt(filters[key]),
        ...filterQuery,
    };
};

const filterDefault = (key, filterQuery, filters, searchFields) => {
    const isSearchable = searchFields.find((item) => item.field === key);
    return {
        ...filterQuery,
        [key]: {
            [isSearchable.mode]: filters[key],
            mode: isSearchable.mode === 'contains' ? 'insensitive' : undefined,
        },
    };
};
