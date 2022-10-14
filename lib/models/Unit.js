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
import { Prisma } from '@prisma/client';

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
    selectSectionCNByIds,
    selectSectionCNByUnitId,
    unassignSectionCNFromUnit,
    assignSectionCNToUnit,
);

export const insertOne = function* (unit) {
    const { communities: unitCommunities, ...data } = unit;
    const insertedUnit = yield prisma.unit.create({
        data,
    });

    const communities = yield updateCommunities(
        unitCommunities,
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
    const { communities: unitCommunities, ...data } = unit;
    const updatedUnit = yield prisma.unit.update({
        where: { id: unitId },
        data,
    });

    const communities = yield updateCommunities(
        unitCommunities,
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
        select: {
            id: true,
            code: true,
            name: true,
        },
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
    const data = yield prisma.unit.findMany({
        select: {
            id: true,
            code: true,
            janus_account_unit: {
                select: {
                    index: true,
                    janus_account_id: true,
                },
                where: {
                    janus_account_id: parseInt(userId),
                },
            },
        },
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
    return data.map((unit) => ({
        id: unit.id,
        code: unit.code,
        janus_account_id: unit.janus_account_unit[0].janus_account_id,
        index: unit.janus_account_unit[0].index,
    }));
};

export const selectByInistAccountId = function* (inistAccountId) {
    const data = yield prisma.unit.findMany({
        select: {
            id: true,
            code: true,
            inist_account_unit: {
                select: {
                    index: true,
                    inist_account_id: true,
                },
                where: {
                    inist_account_id: parseInt(inistAccountId),
                },
            },
        },
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
    return data.map((unit) => ({
        id: unit.id,
        code: unit.code,
        inist_account_id: unit.inist_account_unit[0].inist_account_id,
        index: unit.inist_account_unit[0].index,
    }));
};

export const getUnits = function* (options = {}) {
    const { offset, take, order, filters } = options;

    let orderRawSQL = 'ORDER BY id ASC';
    if (order) {
        orderRawSQL = Prisma.sql`ORDER BY ${order}`;
    }

    let filtersForRawSQL = Prisma.sql`WHERE 1 = 1`;
    if (filters.match) {
        filtersForRawSQL = Prisma.sql`WHERE NAME ILIKE ${`%${filters.match}%`}`;
    }

    const units = yield prisma.$queryRaw`SELECT *,
        ARRAY(${selectCommunities}) AS communities,
        ARRAY(${selectInstitutes}) AS institutes,
        ARRAY(${selectSectionsCN}) AS sections_cn,
        (${selectNbInistAccount})::INT AS nb_inist_account,
        (${selectNbJanusAccount})::INT AS nb_janus_account
        FROM unit ${filtersForRawSQL} ${orderRawSQL} OFFSET ${offset} LIMIT ${take}`;
    return units;
};

export const selectOne = function* (id) {
    const unit = yield prisma.unit.findUnique({
        where: { id },
    });
    return unit;
};

export const batchUpsertPerCode = function* (units) {
    return yield prisma.$transaction(
        units.map((unit) =>
            prisma.unit.upsert({
                where: { code: unit.code },
                update: unit,
                create: unit,
            }),
        ),
    );
};

export const upsertOnePerCode = function* (unit) {
    return yield prisma.unit.upsert({
        where: { code: unit.code },
        update: unit,
        create: unit,
    });
};

export const selectOneByCode = function* (code) {
    const unit = yield prisma.unit.findUnique({
        where: { code },
    });
    return unit;
};
