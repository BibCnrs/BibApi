import {
    selectByIds as selectCommunitiesByIds,
    selectByUnitId as selectCommunitiesByUnitId,
} from './Community';
import {
    selectByIds as selectInstitutesByIds,
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
import prisma from '../prisma/prisma';
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
    selectInstitutesByIds,
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
    const {
        communities: unitCommunities,
        institutes: unitInstitutes,
        sections_cn: unitSections_cn,
        ...data
    } = unit;
    const insertedUnit = yield prisma.unit.create({
        data,
    });

    const communities = yield updateCommunities(
        unitCommunities,
        insertedUnit.id,
    );

    const institutes = yield updateInstitutes(unitInstitutes, insertedUnit.id);
    const sectionsCN = yield updateSectionsCN(unitSections_cn, insertedUnit.id);

    return {
        ...insertedUnit,
        communities,
        institutes,
        sections_cn: sectionsCN,
    };
};

export const updateOne = function* (unitId, unit) {
    const {
        communities: unitCommunities,
        institutes: unitInstitutes,
        sections_cn: unitSections_cn,
        nb_inist_account,
        nb_janus_account,
        ...data
    } = unit;
    const updatedUnit = yield prisma.unit.update({
        where: { id: parseInt(unitId) },
        data,
    });

    const communities = yield updateCommunities(
        unitCommunities,
        updatedUnit.id,
    );
    const institutes = yield updateInstitutes(unitInstitutes, updatedUnit.id);
    const sectionsCN = yield updateSectionsCN(unitSections_cn, updatedUnit.id);

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
    const units = yield prisma.unit.findMany({
        skip: offset,
        take: take,
        where: filters,
        orderBy: order ? order : { id: 'asc' },
        include: {
            unit_community: {
                select: {
                    community_id: true,
                },
            },
            unit_institute: {
                select: {
                    institute_id: true,
                },
            },
            unit_section_cn: {
                select: {
                    section_cn_id: true,
                },
            },
            _count: {
                select: {
                    janus_account: true,
                    inist_account: true,
                },
            },
        },
    });
    for (const unit of units) {
        unit.communities = unit.unit_community.map((item) => item.community_id);
        delete unit.unit_community;
        unit.institutes = unit.unit_institute.map((item) => item.institute_id);
        delete unit.unit_institute;
        unit.sections_cn = unit.unit_section_cn.map(
            (item) => item.section_cn_id,
        );
        delete unit.unit_section_cn;
        unit.nb_inist_account = unit._count.inist_account;
        unit.nb_janus_account = unit._count.janus_account;
        delete unit._count;
    }
    return units;
};

export const selectOne = function* (id) {
    const unit = yield prisma.$queryRaw`
        SELECT *,
            ARRAY(${selectCommunities}) AS communities,
            ARRAY(${selectInstitutes}) AS institutes,
            ARRAY(${selectSectionsCN}) AS sections_cn,
            (${selectNbInistAccount})::INT AS nb_inist_account,
            (${selectNbJanusAccount})::INT AS nb_janus_account
        FROM unit WHERE id = ${parseInt(id)} LIMIT 1;`;
    return unit[0];
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
