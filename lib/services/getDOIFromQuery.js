import get from 'lodash.get';

const doiRegex = new RegExp(
    '(10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?![%"#? ])\\S)+)',
);

export const isDOI = (term) => (term ? !!term.match(doiRegex) : false);

export default (query) => {
    if (query.queries.length === 1 && get(query, 'queries[0].field') === null) {
        const term = get(query, 'queries[0].term');
        return isDOI(term) ? term : null;
    }

    return null;
};
