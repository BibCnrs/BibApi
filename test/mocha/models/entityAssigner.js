import entityAssigner from '../../../lib/models/entityAssigner';

describe('entityAssigner', function () {
    let selectAssignedCall, selectAssignedByOwnerCall, selectAssignedByOwnerResult, unassignFromOwnerCall, assignToOwnerCall, assignEntity;

    before(function () {
        const selectAssigned = (ids) => {
            selectAssignedCall = ids;
            return ids.map(id => ({ id }));
        };
        const selectAssignedByOwner = function* (id) {
            selectAssignedByOwnerCall = id;
            return selectAssignedByOwnerResult || [];
        };
        const unassignFromOwner = function* (idsToRemove, ownerId) {
            unassignFromOwnerCall = { idsToRemove, ownerId };
        };
        const assignToOwner = function* (idsToAdd, ownerId) {
            assignToOwnerCall = { idsToAdd, ownerId };
        };

        assignEntity = entityAssigner(selectAssigned, selectAssignedByOwner, unassignFromOwner, assignToOwner);
    });

    beforeEach(function () {
        selectAssignedCall = null;
        selectAssignedByOwnerCall = null;
        unassignFromOwnerCall = null;
        assignToOwnerCall = null;
    });

    it('should call selectAssigned with given assignedIdentifiers, and selectAssignedByOwner with given ownerId', function* () {
        const assignedIdentifiers = [1,2,3];
        const ownerId = 10;
        yield assignEntity(assignedIdentifiers, ownerId);

        assert.deepEqual(selectAssignedCall, assignedIdentifiers);
        assert.equal(selectAssignedByOwnerCall, ownerId);
    });

    it('should call unassignFromOwner with ownerId and the list of id to remove (those returned by selectAssignedByOwner that are not in assignedIdentifiers)', function* () {
        const assignedIdentifiers = [1,2,3];
        const ownerId = 10;
        selectAssignedByOwnerResult = [{ id: 1}, { id: 4 }, { id: 5 }];
        yield assignEntity(assignedIdentifiers, ownerId);
        assert.deepEqual(unassignFromOwnerCall, { idsToRemove: [4, 5], ownerId });
    });

    it('should not call unassignFromOwner if no id to remove (id returned by selectAssignedByOwner are all in assignedIdentifiers)', function* () {
        const assignedIdentifiers = [1, 2, 3];
        const ownerId = 10;
        selectAssignedByOwnerResult = [{ id: 1 }, { id: 2 }, { id: 3 }];
        yield assignEntity(assignedIdentifiers, ownerId);

        assert.isNull(unassignFromOwnerCall);
    });

    it('should call assignToOwner with ownerId and the list of id to remove (those not returned by selectAssignedByOwner but that are in assignedIdentifiers)', function* () {
        const assignedIdentifiers = [1, 2, 3, 4];
        const ownerId = 10;
        selectAssignedByOwnerResult = [{ id: 1}, { id: 4 }, { id: 5 }];
        yield assignEntity(assignedIdentifiers, ownerId);
        assert.deepEqual(assignToOwnerCall, { idsToAdd: [2, 3], ownerId });
    });

    it('should not call assignToOwner if no id to add (id in assignedIdentifiers are all returned by selectAssignedByOwner)', function* () {
        const assignedIdentifiers = [1, 2, 3];
        const ownerId = 10;
        selectAssignedByOwnerResult = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
        yield assignEntity(assignedIdentifiers, ownerId);

        assert.isNull(assignToOwnerCall);
    });
});
