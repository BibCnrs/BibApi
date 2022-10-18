import { insertOne as insertOneRevue } from '../../lib/models/Revue';
import { insertOne as insertOneUnit } from '../../lib/models/Unit';
import { insertOne as insertOneAdminUser } from '../../lib/models/AdminUser';
import { insertOne as insertOneDatabase } from '../../lib/models/Database';
import { insertOne as insertOneCommunity } from '../../lib/models/Community';
import { insertOne as insertJanusAccount } from '../../lib/models/JanusAccount';
import { insertOne as insertOneInstitute } from '../../lib/models/Institute';
import { insertOne as insertOneSectionCN } from '../../lib/models/SectionCN';
import { insertOne as insertOneHistory } from '../../lib/models/History';
import { insertOne as insertOneInistAccount } from '../../lib/models/InistAccount';
import prisma from '../../lib/prisma/prisma';

export default function () {
    function* createAdminUser(data) {
        return yield insertOneAdminUser(data);
    }

    function* createCommunity(data) {
        const defaultCommunity = {
            name: 'vie',
            gate: 'insb',
            user_id: 'vieUserId',
            password: 'viePassword',
            profile: 'profile_vie',
        };

        return yield insertOneCommunity({
            ...defaultCommunity,
            ...data,
        });
    }

    function* createJanusAccount(data) {
        const defaultJanusAccount = {};

        const janusAccount = yield insertJanusAccount({
            ...defaultJanusAccount,
            ...data,
        });

        return {
            ...janusAccount,
            password: data.password,
        };
    }

    function* createInistAccount(data) {
        const defaultInistAccount = {
            password: 'secret',
        };

        const inistAccount = yield insertOneInistAccount({
            ...defaultInistAccount,
            ...data,
        });

        return {
            ...inistAccount,
            password: data.password,
        };
    }

    function* createInstitute(data) {
        const defaultInstitute = {
            code: '53',
            name: 'Institut des sciences biologique',
            communities: [],
        };
        return yield insertOneInstitute({
            ...defaultInstitute,
            ...data,
        });
    }

    function* createUnit(data) {
        const defaultUnit = {
            code: 'Unité pluriel',
            communities: [],
        };
        return yield insertOneUnit({
            ...defaultUnit,
            ...data,
        });
    }

    function* createHistory(data) {
        const defaultHistory = { event: '{ "foo": 42 }' };
        return yield insertOneHistory({
            ...defaultHistory,
            ...data,
        });
    }

    function* createDatabase(data) {
        const defaultDatabase = {
            name_fr: 'réseau du ciel',
            name_en: 'skynet',
            text_fr: 'français',
            text_en: 'english',
            url_fr: 'http://www.url.fr',
            url_en: 'http://www.url.en',
            communities: [],
        };
        return yield insertOneDatabase({
            ...defaultDatabase,
            ...data,
        });
    }

    function* createSectionCN(data) {
        const defaultSectionCN = {
            name: 'la secion',
            code: '1',
            primary_institutes: null,
            primary_units: [],
        };
        return yield insertOneSectionCN({
            ...defaultSectionCN,
            ...data,
        });
    }

    function* createRevue(data) {
        const defaultSectionCN = {
            title: 'The revue',
            url: 'www.the-revue.com',
        };
        return yield insertOneRevue({
            ...defaultSectionCN,
            ...data,
        });
    }

    function* clear() {
        yield prisma.$queryRaw`DELETE FROM admin_user`;
        yield prisma.$queryRaw`DELETE FROM community CASCADE`;
        yield prisma.$queryRaw`DELETE FROM janus_account CASCADE`;
        yield prisma.$queryRaw`DELETE FROM inist_account CASCADE`;
        yield prisma.$queryRaw`DELETE FROM institute CASCADE`;
        yield prisma.$queryRaw`DELETE FROM unit CASCADE`;
        yield prisma.$queryRaw`DELETE FROM database CASCADE`;
        yield prisma.$queryRaw`DELETE FROM history CASCADE`;
        yield prisma.$queryRaw`DELETE FROM section_cn CASCADE`;
        yield prisma.$queryRaw`DELETE FROM revue CASCADE`;
    }

    return {
        createAdminUser,
        createJanusAccount,
        createInistAccount,
        createCommunity,
        createInstitute,
        createUnit,
        createDatabase,
        createHistory,
        createSectionCN,
        createRevue,
        clear,
    };
}
