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
import prisma from '../prisma/prisma';
import { Prisma } from '@prisma/client';

const updateCommunities = entityAssigner(
    selectCommunityByIds,
    selectCommunityByInistAccountId,
    unassignCommunityFromRevue,
    assignCommunityToRevue,
);

export const selectOne = function* selectOne(id) {
    const data = yield prisma.revue.findFirst({
        where: { id: parseInt(id) },
        include: {
            revue_community: {
                select: {
                    community: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
    });

    const communities = data.revue_community.map((item) => item.community.id);
    data.communities = uniqBy(communities);
    delete data.revue_community;
    return data;
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
        where: { id: parseInt(revueId) },
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

export const getRevues = function* (options) {
    const { offset, take, sortDir = 'ASC', filters } = options;

    return yield prisma.$queryRawUnsafe(
        `SELECT id,
        title,
        url,
        ARRAY(SELECT id
            FROM community
            JOIN revue_community ON (community.id = revue_community.community_id)
            WHERE revue_community.revue_id = revue.id) AS communities,
        ARRAY(SELECT gate
            FROM community
            JOIN revue_community ON (community.id = revue_community.community_id)
            WHERE revue_community.revue_id = revue.id) AS gates,
        ARRAY(SELECT name
            FROM community
            JOIN revue_community ON (community.id = revue_community.community_id)
            WHERE revue_community.revue_id = revue.id) AS domains 
        FROM revue LEFT JOIN revue_community ON revue.id = revue_community.revue_id
        ${filters.title ? `WHERE revue.title ILIKE $3` : ''}
        ${
            filters.community_id
                ? `${
                      filters.title ? 'AND' : 'WHERE'
                  } revue_community.community_id = $4`
                : ''
        }
        GROUP BY revue.id
        ORDER BY revue.title ${sortDir}
        LIMIT $1
        OFFSET $2`,
        take,
        offset,
        `%${filters.title}%`,
        filters.community_id || '',
    );
};

export const getRevuesCount = function* (options) {
    const { filters } = options;
    const total = yield prisma.$queryRawUnsafe(
        `SELECT COUNT(id)::int
        FROM revue 
        ${
            filters.community_id
                ? 'LEFT JOIN revue_community ON revue.id = revue_community.revue_id'
                : ''
        }
        ${filters.title ? `WHERE revue.title ILIKE $1` : ''}
        ${
            filters.community_id
                ? `${
                      filters.title ? 'AND' : 'WHERE'
                  } revue_community.community_id = $2`
                : ''
        }
        `,
        `%${filters.title}%`,
        filters.community_id || '',
    );

    return total[0].count;
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
