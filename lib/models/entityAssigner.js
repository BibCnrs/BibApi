export default function entityAssigner(
    selectAssigned,
    selectAssignedByOwner,
    unassignFromOwner,
    assignToOwner,
) {
    return function* assignEntity(assignedIdentifiers = [], ownerId) {
        const nextEntities =
            assignedIdentifiers && assignedIdentifiers.length
                ? yield selectAssigned(assignedIdentifiers)
                : [];

        const nextEntitiesId = nextEntities.map((entity) => entity.id);
        const prevEntities = yield selectAssignedByOwner(ownerId);
        const prevEntitiesId = prevEntities.map((entity) => entity.id);
        const removedIds = prevEntitiesId.filter(
            (id) => nextEntitiesId.indexOf(id) === -1,
        );
        if (removedIds.length > 0) {
            yield unassignFromOwner(removedIds, ownerId);
        }
        if (nextEntitiesId.length > 0) {
            yield assignToOwner(nextEntitiesId, ownerId);
        }

        return nextEntities;
    };
}
