import prisma from '../../prisma/prisma';

export const assignInstituteToUnit = function* (instituteIds, unitId) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.unit_institute.upsert({
                where: { institute_id: instituteId, unit_id: unitId, index },
                update: {},
                create: { institute_id: instituteId, unit_id: unitId, index },
            }),
        ),
    );
};

export const unassignInstituteFromUnit = function* (instituteIds, unitId) {
    return yield prisma.$transaction(
        instituteIds.map((instituteId, index) =>
            prisma.unit_institute.delete({
                where: { institute_id: instituteId, unit_id: unitId, index },
            }),
        ),
    );
};
