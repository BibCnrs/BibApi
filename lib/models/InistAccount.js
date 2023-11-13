import _ from 'lodash';
import prisma from '../prisma/prisma';

import entityAssigner from './entityAssigner';

import {
    selectByIds as selectCommunitiesByIds,
    selectByInistAccountId as selectCommunitiesByInistAccountId,
} from './Community';

import {
    selectByIds as selectInstituteByIds,
    selectByInistAccountId as selectInstituteByInistAccountId,
} from './Institute';

import {
    selectByIds as selectUnitByIds,
    selectByInistAccountId as selectUnitByInistAccountId,
} from './Unit';
import {
    assignCommunityToInistAccount,
    unassignCommunityFromInistAccount,
} from './InistAccountCommunity';
import {
    assignInstituteToInistAccount,
    unassignInstituteFromInistAccount,
} from './InistAccountInstitute';
import {
    assignUnitToInistAccount,
    unassignUnitFromInistAccount,
} from './InistAccountUnit';
import {
    selectAdditionalInstituteName,
    selectCommunities,
    selectDomains,
    selectGroups,
    selectMainInstituteCode,
    selectMainInstituteCommunities,
    selectMainInstituteDomains,
    selectMainInstituteGroups,
    selectMainUnitCode,
    selectMainUnitCommunities,
    selectMainUnitDomains,
    selectMainUnitGroups,
    selectUnits,
    selectInstitutes,
} from '../queries/inistAccountQueries';

export const addDomains = (inistAccount) => {
    if (!inistAccount) {
        return null;
    }
    return {
        ...inistAccount,
        domains: _.uniq(
            inistAccount.main_institute_domains
                .concat(inistAccount.main_unit_domains)
                .concat(inistAccount.domains),
        ),
        groups: _.uniq(
            inistAccount.main_institute_groups
                .concat(inistAccount.main_unit_groups)
                .concat(inistAccount.groups),
        ),
    };
};

export const addAllCommunities = (inistAccount) => {
    if (!inistAccount) {
        return null;
    }

    return {
        ...inistAccount,
        all_communities: _.uniq(
            inistAccount.main_institute_communities
                .concat(inistAccount.main_unit_communities)
                .concat(inistAccount.communities),
        ),
    };
};

export const updateCommunities = entityAssigner(
    selectCommunitiesByIds,
    selectCommunitiesByInistAccountId,
    unassignCommunityFromInistAccount,
    assignCommunityToInistAccount,
);

export const updateInstitutes = entityAssigner(
    selectInstituteByIds,
    selectInstituteByInistAccountId,
    unassignInstituteFromInistAccount,
    assignInstituteToInistAccount,
);

export const updateUnits = entityAssigner(
    selectUnitByIds,
    selectUnitByInistAccountId,
    unassignUnitFromInistAccount,
    assignUnitToInistAccount,
);

export const selectOneByUsername = function* (username) {
    const inistAccount = yield prisma.$queryRaw`
    SELECT 
        *, 
        ARRAY(${selectMainInstituteDomains}) as main_institute_domains,
        ARRAY(${selectMainUnitDomains}) as main_unit_domains,
        ARRAY(${selectDomains}) AS domains,
        ARRAY(${selectMainUnitGroups}) as main_unit_groups,
        ARRAY(${selectMainInstituteGroups}) as main_institute_groups,
        ARRAY(${selectGroups}) AS groups
    FROM inist_account
    WHERE username = ${username}`;

    return addDomains(inistAccount[0]);
};

export const selectEzTicketInfoForId = function* (id) {
    const [result] = yield prisma.$queryRaw`
    SELECT 
        username,
        ARRAY(${selectMainInstituteCode}) AS institute,
        ARRAY(${selectMainUnitCode}) AS unit,
        ARRAY(${selectMainUnitGroups}) as main_unit_groups,
        ARRAY(${selectMainInstituteGroups}) as main_institute_groups,
        ARRAY(${selectGroups}) AS groups
    FROM inist_account WHERE id = ${parseInt(id)}`;

    return {
        username: `${result.username}_O_UNKNOWN_I_${result.institute}_OU_${result.unit}`,
        groups: [
            ..._.uniq(
                result.main_institute_groups
                    .concat(result.main_unit_groups)
                    .concat(result.groups),
            ),
        ],
    };
};

export const selectOne = function* (id) {
    const inistAccount = yield prisma.$queryRaw`
        SELECT 
            *, 
            ARRAY(${selectMainInstituteCommunities}) as main_institute_communities  ,
            ARRAY(${selectMainUnitCommunities}) as main_unit_communities    ,
            ARRAY(${selectCommunities}) AS communities,
            ARRAY(${selectInstitutes}) AS institutes , 
            ARRAY(${selectUnits}) AS units  
        FROM inist_account
        WHERE id = ${parseInt(id)}`;

    return addAllCommunities(inistAccount[0]);
};

export const selectOneByUsernameAndPassword = function* (username, password) {
    const inistAccount = yield prisma.$queryRaw`
    SELECT 
        *, 
        ARRAY(${selectMainInstituteDomains}) as main_institute_domains,
        ARRAY(${selectMainUnitDomains}) as main_unit_domains,
        ARRAY(${selectDomains}) AS domains,
        ARRAY(${selectMainUnitGroups}) as main_unit_groups,
        ARRAY(${selectMainInstituteGroups}) as main_institute_groups,
        ARRAY(${selectGroups}) AS groups
    FROM inist_account
    WHERE username = ${username} AND password = ${password}`;

    return addDomains(inistAccount[0]);
};

export const getInistAccount = function* () {
    const inistAccounts = yield prisma.$queryRaw`
        SELECT 
            *, 
            ARRAY(${selectMainInstituteCommunities}) as main_institute_communities  ,
            ARRAY(${selectMainUnitCommunities}) as main_unit_communities    ,
            ARRAY(${selectCommunities}) AS communities,
            ARRAY(${selectInstitutes}) AS institutes , 
            ARRAY(${selectUnits}) AS units  
        FROM inist_account
        GROUP BY id
        ORDER BY id ASC`;

    return inistAccounts.map(addAllCommunities);
};

export const cleanInistAccount = function* (inistAccount) {
    if (inistAccount.expiration_date) {
        inistAccount.expiration_date = new Date(inistAccount.expiration_date);
    }

    if (inistAccount.subscription_date) {
        inistAccount.subscription_date = new Date(
            inistAccount.subscription_date,
        );
    }

    if (inistAccount.main_institute === '') {
        delete inistAccount.main_institute;
    }

    if (inistAccount.main_unit === '') {
        delete inistAccount.main_unit;
    }

    return inistAccount;
};

export const insertOne = function* (inistAccount) {
    let {
        units: inistAccountUnits,
        communities: inistAccountCommunities,
        institutes: inistAccountInstitutes,
        ...data
    } = inistAccount;

    // We transform dates string to date object
    data = yield cleanInistAccount(data);

    const insertedInistAccount = yield prisma.inist_account.create({
        data,
    });

    const communities = yield updateCommunities(
        inistAccountCommunities,
        insertedInistAccount.id,
    );
    const institutes = yield updateInstitutes(
        inistAccountInstitutes,
        insertedInistAccount.id,
    );
    const units = yield updateUnits(inistAccountUnits, insertedInistAccount.id);

    return {
        ...insertedInistAccount,
        communities,
        institutes,
        units,
    };
};

export const updateLastConnexion = function* (id) {
    return prisma.inist_account.update({
        where: { id: parseInt(id) },
        data: {
            last_connexion: new Date(),
        },
    });
};

export const updateOne = function* (id, inistAccount, specificUpdate = null) {
    let updatedInistAccount;
    let {
        communities: inistAccountCommunities,
        institutes: inistAccountInstitutes,
        units: inistAccountUnits,
        main_institute_communities,
        main_unit_communities,
        all_communities,
        ...data
    } = inistAccount;

    data = yield cleanInistAccount(data);

    if (specificUpdate) {
        updatedInistAccount = yield prisma.inist_account.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                ...specificUpdate,
            },
        });
    } else {
        updatedInistAccount = yield prisma.inist_account.update({
            where: { id: parseInt(id) },
            data: data,
        });
    }

    const communities = yield updateCommunities(
        inistAccountCommunities,
        updatedInistAccount.id,
    );
    const institutes = yield updateInstitutes(
        inistAccountInstitutes,
        updatedInistAccount.id,
    );
    const units = yield updateUnits(inistAccountUnits, updatedInistAccount.id);

    return {
        ...updatedInistAccount,
        communities,
        institutes,
        units,
    };
};

export const authenticate = function* (username, password) {
    const foundInistAccount = yield selectOneByUsernameAndPassword(
        username,
        password,
    );

    if (
        !foundInistAccount ||
        (foundInistAccount.expiration_date &&
            foundInistAccount.expiration_date.getTime() <= Date.now())
    ) {
        return false;
    }

    return foundInistAccount;
};

export const selectAllForExport = function* () {
    const dataForExport = yield prisma.$queryRaw`
        SELECT inist_account.id, inist_account.username, inist_account.password, inist_account.name, 
            inist_account.firstname, inist_account.mail, inist_account.phone, inist_account.dr, inist_account.comment, 
            inist_account.subscription_date, inist_account.expiration_date, inist_account.last_connexion, inist_account.active, 
            institute.name AS main_institute,
            unit.code AS main_unit,
            community.name AS communities,
            ARRAY(${selectAdditionalInstituteName}) AS institutes
        FROM inist_account 
        LEFT JOIN institute ON inist_account.main_institute = institute.id
        LEFT JOIN unit ON inist_account.main_unit = unit.id
        LEFT JOIN inist_account_community ON (inist_account.id = inist_account_community.inist_account_id)
        LEFT JOIN community ON inist_account_community.community_id = community.id`;
    const listForExport = [];
    // Group by communities id
    dataForExport.forEach((element) => {
        const object = listForExport.find((n) => n.id === element.id);
        if (object) {
            if (element.communities) {
                object.communities.push(element.communities);
            }
        } else {
            if (element.communities) {
                element.communities = [element.communities];
            } else {
                element.communities = [];
            }
            listForExport.push(element);
        }
    });
    return listForExport;
};

export const batchUpsertPerUsername = function* (inistAccounts) {
    return yield prisma.$transaction(
        inistAccounts.map((inistAccount) =>
            prisma.inist_account.upsert({
                where: { username: inistAccount.username },
                update: inistAccount,
                create: inistAccount,
            }),
        ),
    );
};
