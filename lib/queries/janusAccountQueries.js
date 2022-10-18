import { Prisma } from '@prisma/client';

export const selectMainInstituteCode = Prisma.sql`SELECT code
FROM institute
WHERE institute.id = janus_account.primary_institute
LIMIT 1`;

export const selectMainUnitCode = Prisma.sql`SELECT code
FROM unit
WHERE unit.id = janus_account.primary_unit
LIMIT 1`;

export const selectAdditionalInstitutes = Prisma.sql`SELECT id
FROM institute
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectAdditionalInstitutesNames = Prisma.sql`SELECT name
FROM institute
JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
WHERE janus_account_institute.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectAdditionalUnits = Prisma.sql`SELECT id
FROM unit
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectAdditionalUnitsCodes = Prisma.sql`SELECT code
FROM unit
JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
WHERE janus_account_unit.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectCommunities = Prisma.sql`SELECT community.id
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectCommunitiesNames = Prisma.sql`SELECT community.name
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectDomains = Prisma.sql`SELECT community.name
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectGroups = Prisma.sql`SELECT gate
FROM community
JOIN janus_account_community ON (community.id = janus_account_community.community_id)
WHERE janus_account_community.janus_account_id = janus_account.id
ORDER BY index ASC`;

export const selectPrimaryInstituteCommunities = Prisma.sql`SELECT community.id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

export const selectPrimaryInstituteCommunitiesNames = Prisma.sql`SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

export const selectPrimaryInstituteDomains = Prisma.sql`SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

export const selectPrimaryInstituteGroups = Prisma.sql`SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
JOIN institute ON (institute_community.institute_id = institute.id)
WHERE institute.id = janus_account.primary_institute
ORDER BY index ASC`;

export const selectPrimaryUnitCommunities = Prisma.sql`SELECT community.id
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

export const selectPrimaryUnitCommunitiesNames = Prisma.sql`SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

export const selectPrimaryUnitDomains = Prisma.sql`SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;

export const selectPrimaryUnitGroups = Prisma.sql`SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
JOIN unit ON (unit_community.unit_id = unit.id)
WHERE unit.id = janus_account.primary_unit
ORDER BY index ASC`;
