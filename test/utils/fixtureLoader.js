import JanusAccount from '../../lib/models/JanusAccount';
import InistAccount from '../../lib/models/InistAccount';
import Institute from '../../lib/models/Institute';
import Unit from '../../lib/models/Unit';
import Database from '../../lib/models/Database';
import History from '../../lib/models/History';
import SectionCN from '../../lib/models/SectionCN';
import Revue from '../../lib/models/Revue';
import { insertOne as insertOneAdminUser } from '../../lib/models/AdminUser';
import { insertOne as insertOneCommunity } from '../../lib/models/Community';

export default function (postgres) {
    const janusAccountQueries = JanusAccount(postgres);
    const inistAccountQueries = InistAccount(postgres);
    const instituteQueries = Institute(postgres);
    const unitQueries = Unit(postgres);
    const databaseQueries = Database(postgres);
    const historyQueries = History(postgres);
    const sectionCNQueries = SectionCN(postgres);
    const revueQueries = Revue(postgres);

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

        const janusAccount = yield janusAccountQueries.insertOne({
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

        const inistAccount = yield inistAccountQueries.insertOne({
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
        return yield instituteQueries.insertOne({
            ...defaultInstitute,
            ...data,
        });
    }

    function* createUnit(data) {
        const defaultUnit = {
            code: 'Unité pluriel',
            communities: [],
        };
        return yield unitQueries.insertOne({
            ...defaultUnit,
            ...data,
        });
    }

    function* createHistory(data) {
        const defaultHistory = { event: '{ "foo": 42 }' };
        return yield historyQueries.insertOne({
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
        return yield databaseQueries.insertOne({
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
        return yield sectionCNQueries.insertOne({
            ...defaultSectionCN,
            ...data,
        });
    }

    function* createRevue(data) {
        const defaultSectionCN = {
            title: 'The revue',
            url: 'www.the-revue.com',
        };
        return yield revueQueries.insertOne({
            ...defaultSectionCN,
            ...data,
        });
    }

    function* clear() {
        yield postgres.query({ sql: 'DELETE FROM admin_user' });
        yield postgres.query({ sql: 'DELETE FROM community CASCADE' });
        yield postgres.query({
            sql: 'DELETE FROM janus_account CASCADE',
        });
        yield postgres.query({
            sql: 'DELETE FROM inist_account CASCADE',
        });
        yield postgres.query({ sql: 'DELETE FROM institute CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM unit CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM database CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM history CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM section_cn CASCADE' });
        yield postgres.query({ sql: 'DELETE FROM revue CASCADE' });
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
