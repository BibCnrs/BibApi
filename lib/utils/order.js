export const transformOrderBy = function (sortField, sortDir = 'asc') {
    if (!sortField) {
        return {};
    }

    if (sortField.includes('.')) {
        const [relation, field] = sortField.split('.');
        return {
            [relation]: {
                [field]: sortDir,
            },
        };
    }

    return {
        [sortField]: sortDir,
    };
};
