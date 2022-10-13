import {
    selectByIds as selectCommunitiesByIds,
    selectByUnitId as selectCommunitiesByUnitId,
} from './Community';
import {
    selectByIds as selecteInstitutesByIds,
    selectByUnitId as selectInstitutesById,
} from './Institute';
import {
    assignCommunityToUnit,
    unassignCommunityFromUnit,
} from './UnitCommunity';
import {
    assignInstituteToUnit,
    unassignInstituteFromUnit,
} from './UnitInstitute';
import {
    assignSectionCNToUnit,
    unassignSectionCNFromUnit,
} from './UnitSectionCN';
import entityAssigner from './entityAssigner';
import checkEntityExists from './checkEntityExists';
import {
    selectByUnitId as selectSectionCNByUnitId,
    selectByIds as selectSectionCNByIds,
} from './SectionCN';
import prisma from '../../prisma/prisma';
import {
    selectCommunities,
    selectInstitutes,
    selectNbInistAccount,
    selectNbJanusAccount,
    selectSectionsCN,
} from '../queries/unitQueries';

export const updateCommunities = entityAssigner(
    selectCommunitiesByIds,
    selectCommunitiesByUnitId,
    unassignCommunityFromUnit,
    assignCommunityToUnit,
);

export const updateInstitutes = entityAssigner(
    selecteInstitutesByIds,
    selectInstitutesById,
    unassignInstituteFromUnit,
    assignInstituteToUnit,
);

export const updateSectionsCN = entityAssigner(
    selectSectionCNByUnitId,
    selectSectionCNByIds,
    unassignSectionCNFromUnit,
    assignSectionCNToUnit,
);

export const insertOne = function* (unit) {
    const insertedUnit = yield prisma.unit.create({
        data: unit,
    });

    const communities = yield updateCommunities(
        unit.communities,
        insertedUnit.id,
    );
    const institutes = yield updateInstitutes(unit.institutes, insertedUnit.id);
    const sectionsCN = yield updateSectionsCN(
        unit.sections_cn,
        insertedUnit.id,
    );

    return {
        ...insertedUnit,
        communities,
        institutes,
        sections_cn: sectionsCN,
    };
};

export const updateOne = function* (unitId, unit) {
    const updatedUnit = yield prisma.unit.update({
        where: { id: unitId },
        data: unit,
    });

    const communities = yield updateCommunities(
        unit.communities,
        updatedUnit.id,
    );
    const institutes = yield updateInstitutes(unit.institutes, updatedUnit.id);
    const sectionsCN = yield updateSectionsCN(unit.sections_cn, updatedUnit.id);

    return {
        ...updatedUnit,
        communities,
        institutes,
        sections_cn: sectionsCN,
    };
};

export const selectByIds = function* (ids) {
    const units = yield prisma.unit.findMany({
        where: { id: { in: ids } },
    });
    checkEntityExists('Units', 'id', ids, units);
    return units;
};

export const selectByCodes = function* (codes, check = true) {
    const units = yield prisma.unit.findMany({
        where: { code: { in: codes } },
    });
    if (check) {
        checkEntityExists('Units', 'id', codes, units);
    }

    return units;
};

export const selectByJanusAccountId = function* (userId) {
    return yield prisma.unit.findMany({
        where: {
            janus_account_unit: {
                some: {
                    janus_account_id: parseInt(userId),
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const selectByInistAccountId = function* (inistAccountId) {
    return yield prisma.unit.findMany({
        where: {
            inist_account_unit: {
                some: {
                    inist_account_id: parseInt(inistAccountId),
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    });
};

export const getUnits = function* (options = {}) {
    const { offset, take, order, filters } = options;
    // const units = yield prisma.unit.findMany({
    //     skip: offset,
    //     take: take,
    //     where: filters,
    //     orderBy: order,
    // });

    const units = yield prisma.$queryRaw`SELECT *,
    ARRAY(${selectCommunities}) AS communities,
                ARRAY(${selectInstitutes}) AS institutes,
                ARRAY(${selectSectionsCN}) AS sections_cn,
                (${selectNbInistAccount})::INT AS nb_inist_account,
                (${selectNbJanusAccount})::INT AS nb_janus_account
                 FROM unit OFFSET ${offset} LIMIT ${take}`;
    return units;
};

export const selectOne = function* (id) {
    const unit = yield prisma.unit.findUnique({
        where: { id },
    });
    return unit;
};
