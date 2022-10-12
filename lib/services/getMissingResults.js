import get from 'lodash.get';

export const getResultsIdentifiers = (result) =>
    get(result, 'SearchResult.Data.Records', []).map(
        ({ Header: { DbId, An } }) => ({
            dbId: DbId,
            an: An,
        }),
    );

export default (result1, ids2) => {
    const ids1 = getResultsIdentifiers(result1).map((id, index) => ({
        ...id,
        index,
    }));

    const ids = ids1.filter(
        ({ dbId: dbId1, an: an1 }) =>
            !ids2.find(
                ({ dbId: dbId2, an: an2 }) => dbId1 === dbId2 && an1 === an2,
            ),
    );

    return ids.map(({ index }) => result1.SearchResult.Data.Records[index]);
};
