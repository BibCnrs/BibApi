import prisma from '../prisma/prisma';
const DEFAULT_TABLE = 'license';

export const selectOne = function* (id) {
    return yield prisma[DEFAULT_TABLE].findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            license_community: {
                select: {
                    community_id: true,
                },
            },
        },
    });
};

export const insertOne = function* (data) {
    const { license_community, ...rest } = data;

    const license = license_community
        ? {
              ...rest,
              license_community: {
                  create: license_community,
              },
          }
        : rest;
    return yield prisma[DEFAULT_TABLE].create({
        data: license,
    });
};

export const updateOne = function* (id, data) {
    const { license_community, ...rest } = data;
    const license = license_community
        ? {
              ...rest,
              license_community: {
                  deleteMany: {
                      license_id: parseInt(id),
                  },
                  create: license_community,
              },
          }
        : rest;
    return yield prisma[DEFAULT_TABLE].update({
        where: {
            id: parseInt(id),
        },
        data: license,
    });
};

export const updateForCommon = function* (id) {
    yield prisma.$queryRaw`UPDATE license SET common = FALSE WHERE common`;
    yield prisma.$queryRaw`UPDATE license SET common = TRUE WHERE id = ${parseInt(
        id,
    )};`;
};
