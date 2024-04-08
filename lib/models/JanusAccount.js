import _ from 'lodash';

import prisma from '../prisma/prisma';
import { Prisma } from '@prisma/client';

import {
    selectByIds as selectCommunitiesByIds,
    selectByJanusAccountId as selectCommunitiesByJanusAccountId,
} from './Community';

import {
    selectByIds as selectInstituteByIds,
    selectByJanusAccountId as selectInstituteByJanusAccountId,
} from './Institute';
import {
    selectAdditionalInstitutes,
    selectAdditionalInstitutesNames,
    selectAdditionalUnits,
    selectCommunities,
    selectCommunitiesNames,
    selectDomains,
    selectGroups,
    selectMainInstituteCode,
    selectMainUnitCode,
    selectPrimaryInstituteCommunities,
    selectPrimaryInstituteCommunitiesNames,
    selectPrimaryInstituteDomains,
    selectPrimaryInstituteGroups,
    selectPrimaryUnitCommunities,
    selectPrimaryUnitCommunitiesNames,
    selectPrimaryUnitDomains,
    selectPrimaryUnitGroups,
} from '../queries/janusAccountQueries';
import entityAssigner from './entityAssigner';
import {
    assignCommunityToJanusAccount,
    unassignCommunityFromJanusAccount,
} from './JanusAccountCommunity';
import {
    assignInstituteToJanusAccount,
    unassignInstituteFromJanusAccount,
} from './JanusAccountInstitute';
import {
    selectByIds as selectUnitByIds,
    selectByJanusAccountId as selectUnitByJanusAccountId,
} from './Unit';
import {
    assignUnitToJanusAccount,
    unassignUnitFromJanusAccount,
} from './JanusAccountUnit';

export const addDomains = (janusAccount) => {
    if (!janusAccount) {
        return janusAccount;
    }

    return {
        ...janusAccount,
        domains: _.uniq(
            janusAccount.primary_institute_domains
                .concat(janusAccount.primary_unit_domains)
                .concat(janusAccount.domains),
        ),
        groups: _.uniq(
            janusAccount.primary_institute_groups
                .concat(janusAccount.primary_unit_groups)
                .concat(janusAccount.groups),
        ),
    };
};

export const addAllCommunities = (janusAccount) => {
    if (!janusAccount) {
        return janusAccount;
    }

    return {
        ...janusAccount,
        all_communities: _.uniq(
            janusAccount.primary_institute_communities
                .concat(janusAccount.primary_unit_communities)
                .concat(janusAccount.communities),
        ),
    };
};

export const updateCommunities = entityAssigner(
    selectCommunitiesByIds,
    selectCommunitiesByJanusAccountId,
    unassignCommunityFromJanusAccount,
    assignCommunityToJanusAccount,
);

export const updateAdditionalInstitutes = entityAssigner(
    selectInstituteByIds,
    selectInstituteByJanusAccountId,
    unassignInstituteFromJanusAccount,
    assignInstituteToJanusAccount,
);

export const updateAdditionalUnits = entityAssigner(
    selectUnitByIds,
    selectUnitByJanusAccountId,
    unassignUnitFromJanusAccount,
    assignUnitToJanusAccount,
);

export const selectOneByUid = function* (uid) {
    const janusAccount = yield prisma.$queryRaw`SELECT *,
        ARRAY(${selectPrimaryInstituteDomains}) as primary_institute_domains,
        ARRAY(${selectPrimaryUnitDomains}) as primary_unit_domains,
        ARRAY(${selectDomains}) AS domains,
        ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups,
        ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups,
        ARRAY((${selectAdditionalUnits})) AS additional_units,
        ARRAY((${selectAdditionalInstitutes})) AS additional_institutes,
        ARRAY(${selectGroups}) AS groups
        FROM janus_account
        WHERE uid LIKE ${uid.toString()}`;
    return addDomains(janusAccount[0]);
};

export const selectEzTicketInfoForId = function* selectEzTicketInfoForId(id) {
    const [result] = yield prisma.$queryRaw`SELECT 
        mail,
        cnrs,
        ARRAY(${selectMainInstituteCode}) AS institute,
        ARRAY(${selectMainUnitCode}) AS unit,
        ARRAY(${selectPrimaryInstituteGroups}) as primary_institute_groups,
        ARRAY(${selectPrimaryUnitGroups}) as primary_unit_groups,
        ARRAY(${selectGroups}) AS groups
        FROM janus_account WHERE id = ${parseInt(id)}`;

    return {
        username: `${result.mail}_O_${result.cnrs ? 'CNRS' : 'OTHER'}_I_${
            result.institute
        }_OU_${result.unit}`,
        groups: [
            ..._.uniq(
                result.primary_institute_groups
                    .concat(result.primary_unit_groups)
                    .concat(result.groups),
            ),
        ],
    };
};

export const selectOne = function* (id) {
    const janusAccount = yield prisma.$queryRaw`
        SELECT janus_account.id, janus_account.uid, janus_account.name, janus_account.firstname,
            janus_account.mail, janus_account.cnrs, janus_account.comment, 
            janus_account.last_connexion, janus_account.first_connexion, janus_account.active, 
            janus_account.favorite_domain,janus_account.favourite_resources, 
            institute.id AS primary_institute,
            unit.id AS primary_unit,
            ARRAY((${selectAdditionalUnits})) AS additional_units,
            ARRAY((${selectAdditionalInstitutes})) AS additional_institutes,
            ARRAY((${selectCommunities})) AS communities,
            ARRAY((${selectPrimaryInstituteCommunities})) AS primary_institute_communities,
            ARRAY((${selectPrimaryUnitCommunities})) AS primary_unit_communities
        FROM janus_account 
        LEFT JOIN institute ON janus_account.primary_institute = institute.id
        LEFT JOIN unit ON janus_account.primary_unit = unit.id
        LEFT JOIN janus_account_unit ON (janus_account.id = janus_account_unit.janus_account_id)
        LEFT JOIN unit AS unit2 ON (janus_account_unit.unit_id = unit2.id)
        WHERE janus_account.id = ${parseInt(id)}`;

    return addAllCommunities(janusAccount[0]);
};

export const getJanusAccounts = function* () {
    const janusAccounts = yield prisma.$queryRaw`
        SELECT janus_account.id, janus_account.uid, janus_account.name, janus_account.firstname,
            janus_account.mail, janus_account.cnrs, janus_account.comment, 
            janus_account.last_connexion, janus_account.first_connexion, janus_account.active, 
            janus_account.favorite_domain,janus_account.favourite_resources, 
            institute.id AS primary_institute,
            unit.id AS primary_unit,
            ARRAY((${selectAdditionalUnits})) AS additional_units,
            ARRAY((${selectAdditionalInstitutes})) AS additional_institutes,
            ARRAY((${selectCommunities})) AS communities,
            ARRAY((${selectPrimaryInstituteCommunities})) AS primary_institute_communities,
            ARRAY((${selectPrimaryUnitCommunities})) AS primary_unit_communities
        FROM janus_account 
        LEFT JOIN institute ON janus_account.primary_institute = institute.id
        LEFT JOIN unit ON janus_account.primary_unit = unit.id
        LEFT JOIN janus_account_unit ON (janus_account.id = janus_account_unit.janus_account_id)
        LEFT JOIN unit AS unit2 ON (janus_account_unit.unit_id = unit2.id)
        ORDER BY janus_account.id ASC`;

    return janusAccounts.map(addAllCommunities);
};

export const insertOne = function* insertOne(janusAccount) {
    const {
        additional_units: additionalUnits,
        communities: communitiesJanusAccount,
        additional_institutes: additionalInstitutes,
        ...janusAccountWithoutAdditionalUnits
    } = janusAccount;
    const insertedUser = yield prisma.janus_account.create({
        data: janusAccountWithoutAdditionalUnits,
    });

    const communities = yield updateCommunities(
        communitiesJanusAccount,
        insertedUser.id,
    );
    const additional_institutes = yield updateAdditionalInstitutes(
        additionalInstitutes,
        insertedUser.id,
    );
    const additional_units = yield updateAdditionalUnits(
        additionalUnits,
        insertedUser.id,
    );

    return {
        ...insertedUser,
        communities,
        additional_institutes,
        additional_units,
    };
};

export const updateOne = function* (janusAccountId, janusAccount) {
    let updatedUser;

    const {
        communities: janusAccountCommunities,
        additional_institutes: janusAccountInstitutes,
        additional_units: janusAccountUnits,
        primary_institute_communities,
        primary_unit_communities,
        all_communities,
        ...data
    } = janusAccount;

    if (data.primary_institute === '') {
        delete data.primary_institute;
    }

    if (data.primary_unit === '') {
        delete data.primary_unit;
    }

    data.favourite_resources =
        data.favourite_resources != null
            ? data.favourite_resources
            : Prisma.JsonNull;

    try {
        updatedUser = yield prisma.janus_account.update({
            where: {
                id: parseInt(janusAccountId),
            },
            data,
        });
    } catch (error) {
        throw new Error(error);
    }

    let communities;
    let additional_institutes;
    let additional_units;

    if (janusAccountCommunities) {
        communities = yield updateCommunities(
            janusAccountCommunities,
            updatedUser.id,
        );
    }
    if (janusAccountInstitutes) {
        additional_institutes = yield updateAdditionalInstitutes(
            janusAccountInstitutes,
            updatedUser.id,
        );
    }
    if (janusAccountUnits) {
        additional_units = yield updateAdditionalUnits(
            janusAccountUnits,
            updatedUser.id,
        );
    }

    return {
        ...updatedUser,
        communities,
        additional_institutes,
        additional_units,
    };
};

export const getSimilarAccount = function* getSimilarAccount(
    uid,
    name,
    firstname,
) {
    if (yield selectOneByUid(uid)) {
        return []; // not a new user so no check
    }
    return yield prisma.janus_account.findMany({
        where: {
            name,
            firstname,
        },
        orderBy: {
            uid: 'desc',
        },
    });
};

export const getFavouriteResources = function* (id) {
    const result = yield prisma.janus_account.findUnique({
        where: {
            id: parseInt(id),
        },
        select: {
            favourite_resources: true,
        },
    });
    return result.favourite_resources;
};

export const updateFavouriteResources = function* (id, favouriteResources) {
    return yield prisma.janus_account.update({
        where: {
            id: parseInt(id),
        },
        data: {
            favourite_resources: favouriteResources,
        },
    });
};

export const selectAllForExport = function* () {
    const dataForExport =
        yield prisma.$queryRaw`SELECT janus_account.id, janus_account.uid, janus_account.name, janus_account.firstname,
                  janus_account.mail, janus_account.cnrs, janus_account.comment, 
                  janus_account.last_connexion, janus_account.first_connexion, janus_account.active, 
                  institute.name AS primary_institute,
                  unit.code AS primary_unit,
                  unit2.code AS additional_units,
                  ARRAY((${selectAdditionalInstitutesNames})) AS additional_institutes,
                  ARRAY((${selectCommunitiesNames})) AS communities,
                  ARRAY(
                    (${selectPrimaryInstituteCommunitiesNames})
                    UNION
                    (${selectPrimaryUnitCommunitiesNames})
                    UNION
                    (${selectCommunitiesNames})
                  ) AS all_communities 
                  FROM janus_account 
                  LEFT JOIN institute ON janus_account.primary_institute = institute.id
                  LEFT JOIN unit ON janus_account.primary_unit = unit.id
                  LEFT JOIN janus_account_unit ON (janus_account.id = janus_account_unit.janus_account_id)
                  LEFT JOIN unit AS unit2 ON (janus_account_unit.unit_id = unit2.id)`;
    const listForExport = [];
    dataForExport.forEach((element) => {
        const object = listForExport.find((n) => n.id === element.id);
        if (object) {
            if (element.additional_units) {
                object.additional_units.push(element.additional_units);
            }
        } else {
            if (element.additional_units) {
                element.additional_units = [element.additional_units];
            } else {
                element.additional_units = [];
            }
            listForExport.push(element);
        }
    });
    return dataForExport;
};

export const upsertOnePerUid = function* (janusAccount) {
    const existingJanusAccount = yield selectOneByUid(janusAccount.uid);

    if (existingJanusAccount) {
        return yield updateOne(existingJanusAccount.id, janusAccount);
    }

    return yield insertOne(janusAccount);
};
