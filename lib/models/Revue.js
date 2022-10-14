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
import { Prisma } from '@prisma/client';

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
    const { communities: communitiesRevue, ...data } = revue;
    const insertedRevue = yield prisma.revue.create({
        data,
    });
    const communities = yield updateCommunities(
        communitiesRevue,
        insertedRevue.id,
    );

    return {
        ...insertedRevue,
        communities,
    };
};

export const updateOne = function* (revueId, revue) {
    const { communities: communitiesRevue, ...data } = revue;
    const updatedRevue = yield prisma.revue.update({
        where: { id: revueId },
        data,
    });

    const communities = yield updateCommunities(
        communitiesRevue,
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
        WHERE community.name IN (${Prisma.join(domains)})
        ORDER BY community.id ASC`;

    return uniqBy(revues, ({ title }) => title).map(({ title, url, gate }) => {
        return {
            title,
            url: `http://${gate}.bib.cnrs.fr/login?url=${url}`,
        };
    });
};
