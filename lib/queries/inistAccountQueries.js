import { Prisma } from '@prisma/client';

export const selectInstitutes = Prisma.sql`SELECT id
FROM institute
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id
ORDER BY index ASC`;

export const selectMainInstituteCode = Prisma.sql`SELECT code
FROM institute
WHERE inist_account.main_institute = institute.id`;

export const selectUnits = Prisma.sql`SELECT id
FROM unit
JOIN inist_account_unit ON (unit.id = inist_account_unit.unit_id)
WHERE inist_account_unit.inist_account_id = inist_account.id
ORDER BY index ASC`;

export const selectMainUnitCode = Prisma.sql`SELECT code
FROM unit
WHERE inist_account.main_unit = unit.id`;

export const selectCommunities = Prisma.sql`SELECT id
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

export const selectDomains = Prisma.sql`SELECT name
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

export const selectGroups = Prisma.sql`SELECT gate
FROM community
JOIN inist_account_community ON (community.id = inist_account_community.community_id)
WHERE inist_account_community.inist_account_id = inist_account.id
ORDER BY index ASC`;

export const selectMainInstituteCommunities = Prisma.sql`SELECT community.id
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

export const selectMainInstituteDomains = Prisma.sql`SELECT community.name
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

export const selectMainInstituteGroups = Prisma.sql`SELECT community.gate
FROM community
JOIN institute_community ON (community.id = institute_community.community_id)
WHERE institute_community.institute_id = inist_account.main_institute
ORDER BY institute_community.index ASC`;

export const selectMainUnitCommunities = Prisma.sql`SELECT community.id
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

export const selectMainUnitGroups = Prisma.sql`SELECT community.gate
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

export const selectMainUnitDomains = Prisma.sql`SELECT community.name
FROM community
JOIN unit_community ON (community.id = unit_community.community_id)
WHERE unit_community.unit_id = inist_account.main_unit
ORDER BY unit_community.index ASC`;

export const selectAdditionalInstituteName = Prisma.sql`SELECT name
FROM institute
JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
WHERE inist_account_institute.inist_account_id = inist_account.id`;
