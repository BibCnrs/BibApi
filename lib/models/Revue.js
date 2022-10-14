import entityAssigner from './entityAssigner';
import uniqBy from 'lodash/uniqBy';
import {
    selectByIds as selectCommunityByIds,
    selectByInistAccountId as selectCommunityByInistAccountId,
} from './Community';
import {
    assignCommunityToRevue,
    unassignCommunityFromRevue,
} from './RevueCommunity';
import prisma from '../../prisma/prisma';
import {
    selectCommunities,
    selectDomains,
    selectGates,
} from '../queries/revueQueries';

const updateCommunities = entityAssigner(
    selectCommunityByIds,
    selectCommunityByInistAccountId,
    unassignCommunityFromRevue,
    assignCommunityToRevue,
);

export const selectOne = function* selectOne(id) {
    return yield prisma.revue.findUnique({
        where: { id },
    });
};

export const insertOne = function* insertOne(revue) {
    const insertedRevue = yield prisma.revue.create({
        data: revue,
    });
    const communities = yield updateCommunities(
        revue.communities,
        insertedRevue.id,
    );

    return {
        ...insertedRevue,
        communities,
    };
};

export const updateOne = function* (revueId, revue) {
    const updatedRevue = yield prisma.revue.update({
        where: { id: revueId },
        data: revue,
    });

    const communities = yield updateCommunities(
        revue.communities,
        updatedRevue.id,
    );

    return {
        ...updatedRevue,
        communities,
    };
};

export const getRevues = function* () {
    return yield prisma.$queryRaw`
        SELECT id,
        title,
        url,
        ARRAY(${selectCommunities}) AS communities,
        ARRAY(${selectGates}) AS gates,
        ARRAY(${selectDomains}) AS domains 
        FROM revue LEFT JOIN revue_community ON revue.id = revue_community.revue_id`;
};

export const getRevuesByDomains = function* (domains) {
    if (!domains || !domains.length) {
        return [];
    }
    const revues = yield prisma.$queryRaw`
        SELECT title, url, community.gate as gate
        FROM revue
            JOIN revue_community ON (revue.id = revue_community.revue_id)
            JOIN community ON (revue_community.community_id = community.id)
        JOIN (
        VALUES ${domains.map(
            (_, index) => `($domain${index + 1}, ${index + 1})`,
        )}
        ) AS x (name, ordering)
        ON community.name::varchar=x.name ORDER BY x.ordering;`;

    return uniqBy(revues, ({ title }) => title).map(({ title, url, gate }) => ({
        title,
        url: `http://${gate}.bib.cnrs.fr/login?url=${url}`,
    }));
};
