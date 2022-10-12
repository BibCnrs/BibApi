import _ from 'lodash';

import inistAccountQueries from '../queries/inistAccountQueries';
import Community from './Community';
import Institute from './Institute';
import Unit from './Unit';
import InistAccountCommunity from './InistAccountCommunity';
import InistAccountInstitute from './InistAccountInstitute';
import InistAccountUnit from './InistAccountUnit';
import entityAssigner from './entityAssigner';

export const addDomains = (inistAccount) => {
    if (!inistAccount) {
        return null;
    }
    return {
        ...inistAccount,
        domains: _.uniq(
            inistAccount.main_institute_domains
                .concat(inistAccount.main_unit_domains)
                .concat(inistAccount.domains),
        ),
        groups: _.uniq(
            inistAccount.main_institute_groups
                .concat(inistAccount.main_unit_groups)
                .concat(inistAccount.groups),
        ),
    };
};

export const addAllCommunities = (inistAccount) => {
    if (!inistAccount) {
        return null;
    }

    return {
        ...inistAccount,
        all_communities: _.uniq(
            inistAccount.main_institute_communities
                .concat(inistAccount.main_unit_communities)
                .concat(inistAccount.communities),
        ),
    };
};

function InistAccount(client) {
    const inistAccountClient = client.link(InistAccount.queries);
    const communityClient = Community(client);
    const instituteClient = Institute(client);
    const unitClient = Unit(client);
    const inistAccountInstituteClient = InistAccountInstitute(client);
    const inistAccountUnitClient = InistAccountUnit(client);

    const inistAccountCommunityClient = InistAccountCommunity(client);

    const updateCommunities = entityAssigner(
        communityClient.selectByIds,
        communityClient.selectByInistAccountId,
        inistAccountCommunityClient.unassignCommunityFromInistAccount,
        inistAccountCommunityClient.assignCommunityToInistAccount,
    );

    const updateInstitutes = entityAssigner(
        instituteClient.selectByIds,
        instituteClient.selectByInistAccountId,
        inistAccountInstituteClient.unassignInstituteFromInistAccount,
        inistAccountInstituteClient.assignInstituteToInistAccount,
    );

    const updateUnits = entityAssigner(
        unitClient.selectByIds,
        unitClient.selectByInistAccountId,
        inistAccountUnitClient.unassignUnitFromInistAccount,
        inistAccountUnitClient.assignUnitToInistAccount,
    );

    const selectOneByUsername = function* selectOneByUsername(...args) {
        const inistAccount = yield inistAccountClient.selectOneByUsername(
            ...args,
        );

        return addDomains(inistAccount);
    };

    const selectEzTicketInfoForId = function* selectEzTicketInfoForId(...args) {
        const [ezTicketInfo] = yield inistAccountClient.selectEzTicketInfoForId(
            ...args,
        );

        return {
            username: `${ezTicketInfo.username}_O_UNKNOWN_I_${ezTicketInfo.institute}_OU_${ezTicketInfo.unit}`,
            groups: [
                ..._.uniq(
                    ezTicketInfo.main_institute_groups
                        .concat(ezTicketInfo.main_unit_groups)
                        .concat(ezTicketInfo.groups),
                ),
            ],
        };
    };

    const selectOne = function* selectOne(...args) {
        const inistAccount = yield inistAccountClient.selectOne(...args);

        return addAllCommunities(inistAccount);
    };

    const selectPage = function* selectPage(...args) {
        const inistAccounts = yield inistAccountClient.selectPage(...args);

        return inistAccounts.map(addAllCommunities);
    };

    const insertOne = function* insertOne(inistAccount) {
        try {
            yield client.begin();
            const insertedInistAccount = yield inistAccountClient.insertOne(
                inistAccount,
            );

            const communities = yield updateCommunities(
                inistAccount.communities,
                insertedInistAccount.id,
            );
            const institutes = yield updateInstitutes(
                inistAccount.institutes,
                insertedInistAccount.id,
            );
            const units = yield updateUnits(
                inistAccount.units,
                insertedInistAccount.id,
            );

            yield client.commit();

            return {
                ...insertedInistAccount,
                communities,
                institutes,
                units,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const updateLastConnexion = function* updateLastConnexion(id) {
        yield inistAccountClient.updateOne(id, {
            last_connexion: new Date(),
        });
    };

    const updateOne = function* (id, inistAccount, specificUpdate = null) {
        try {
            yield client.begin();

            let updatedInistAccount = yield selectOne({ id });
            try {
                if (specificUpdate && updatedInistAccount) {
                    updatedInistAccount = yield inistAccountClient.updateOne(
                        id,
                        {
                            ...updatedInistAccount,
                            ...specificUpdate,
                        },
                    );
                } else {
                    updatedInistAccount = yield inistAccountClient.updateOne(
                        id,
                        inistAccount,
                    );
                }
            } catch (error) {
                if (error.message !== 'no valid column to set') {
                    throw error;
                }
            }
            const communities = yield updateCommunities(
                inistAccount.communities,
                updatedInistAccount.id,
            );
            const institutes = yield updateInstitutes(
                inistAccount.institutes,
                updatedInistAccount.id,
            );
            const units = yield updateUnits(
                inistAccount.units,
                updatedInistAccount.id,
            );

            yield client.commit();

            return {
                ...updatedInistAccount,
                communities,
                institutes,
                units,
            };
        } catch (error) {
            yield client.rollback();
            throw error;
        }
    };

    const authenticate = function* authenticate(username, password) {
        const foundInistAccount = yield selectOneByUsername(username);
        if (
            !foundInistAccount ||
            !foundInistAccount.password ||
            foundInistAccount.password !== password
        ) {
            return false;
        }
        if (
            foundInistAccount.expiration_date &&
            foundInistAccount.expiration_date.getTime() <= Date.now()
        ) {
            return false;
        }

        return foundInistAccount;
    };

    const selectAllForExport = function* () {
        const selectAdditionalInstituteName = `SELECT name
    FROM institute
    JOIN inist_account_institute ON (institute.id = inist_account_institute.institute_id)
    WHERE inist_account_institute.inist_account_id = inist_account.id`;
        const dataForExport = yield client.query({
            sql: `SELECT inist_account.id, inist_account.username, inist_account.password, inist_account.name, 
            inist_account.firstname, inist_account.mail, inist_account.phone, inist_account.dr, inist_account.comment, 
            inist_account.subscription_date, inist_account.expiration_date, inist_account.active, 
            institute.name AS main_institute,
            unit.code AS main_unit,
            community.name AS communities,
            ARRAY(${selectAdditionalInstituteName}) AS institutes
            FROM inist_account 
            LEFT JOIN institute ON inist_account.main_institute = institute.id
            LEFT JOIN unit ON inist_account.main_unit = unit.id
            LEFT JOIN inist_account_community ON (inist_account.id = inist_account_community.inist_account_id)
            LEFT JOIN community ON inist_account_community.community_id = community.id`,
            parameters: {},
        });
        const listForExport = [];
        // Group by communities id
        dataForExport.forEach((element) => {
            const object = listForExport.find((n) => n.id === element.id);
            if (object) {
                if (element.communities) {
                    object.communities.push(element.communities);
                }
            } else {
                if (element.communities) {
                    element.communities = [element.communities];
                } else {
                    element.communities = [];
                }
                listForExport.push(element);
            }
        });
        return listForExport;
    };

    return {
        ...inistAccountClient,
        updateCommunities,
        updateInstitutes,
        updateUnits,
        selectOneByUsername,
        selectEzTicketInfoForId,
        selectOne,
        selectPage,
        insertOne,
        updateOne,
        updateLastConnexion,
        authenticate,
        selectAllForExport,
    };
}

InistAccount.queries = inistAccountQueries;

export default InistAccount;
