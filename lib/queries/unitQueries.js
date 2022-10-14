import { Prisma } from '@prisma/client';

export const selectCommunities = Prisma.sql`SELECT id
FROM community
LEFT JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = unit.id
ORDER BY index ASC`;

export const selectCommunitiesName = Prisma.sql`SELECT name
FROM community
LEFT JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = unit.id
ORDER BY index ASC`;

export const selectInstitutes = Prisma.sql`SELECT id
FROM institute
LEFT JOIN unit_institute ON (institute.id = unit_institute.institute_id)
WHERE unit_institute.unit_id = unit.id
ORDER BY id ASC`;

export const selectSectionsCN = Prisma.sql`SELECT id
FROM section_cn
LEFT JOIN unit_section_cn ON (section_cn.id = unit_section_cn.section_cn_id)
WHERE unit_section_cn.unit_id = unit.id
ORDER BY index ASC`;

export const selectNbInistAccount = Prisma.sql`SELECT COUNT(id)
FROM inist_account
WHERE inist_account.main_unit = unit.id`;

export const selectNbJanusAccount = Prisma.sql`SELECT COUNT(id)
FROM janus_account
WHERE janus_account.primary_unit = unit.id`;
