import { Prisma } from '@prisma/client';

export const selectCommunities = Prisma.sql`SELECT id
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
export const selectDomains = Prisma.sql`SELECT name
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
export const selectGates = Prisma.sql`SELECT gate
FROM community
JOIN revue_community ON (community.id = revue_community.community_id)
WHERE revue_community.revue_id = revue.id`;
