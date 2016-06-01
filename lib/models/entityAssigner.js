
export default function entityAssigner(selectAssigned, selectAssignedByOwner, unassignFromOwner, assignToOwner) {

    return function* assignEntity(assignedIdentifiers = [], ownerId) {
        const nextEntities = assignedIdentifiers.length ? (yield selectAssigned(assignedIdentifiers)) : [];
        const nextEntitiesId = nextEntities.map(entity => entity.id);
        const prevEntities = (yield selectAssignedByOwner(ownerId));
        const prevEntitiesId = prevEntities.map(entity => entity.id);
        const removedIds = prevEntitiesId.filter(id => nextEntitiesId.indexOf(id) === -1);
        const addedIds = nextEntitiesId.filter(id => prevEntitiesId.indexOf(id) === -1);
        if (removedIds.length > 0) {
            yield unassignFromOwner(removedIds, ownerId);
        }
        if(addedIds.length > 0) {
            yield assignToOwner(addedIds, ownerId);
        }

        return nextEntities;
    };
}
