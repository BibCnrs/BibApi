import _ from "lodash";

import janusAccountQueries from "../queries/janusAccountQueries";
import Community from "./Community";
import Institute from "./Institute";
import Unit from "./Unit";
import JanusAccountCommunity from "./JanusAccountCommunity";
import JanusAccountInstitute from "./JanusAccountInstitute";
import JanusAccountUnit from "./JanusAccountUnit";
import entityAssigner from "./entityAssigner";

export const addDomains = janusAccount => {
  if (!janusAccount) {
    return janusAccount;
  }

  return {
    ...janusAccount,
    domains: _.uniq(
      janusAccount.primary_institute_domains
        .concat(janusAccount.primary_unit_domains)
        .concat(janusAccount.domains)
    ),
    groups: _.uniq(
      janusAccount.primary_institute_groups
        .concat(janusAccount.primary_unit_groups)
        .concat(janusAccount.groups)
    )
  };
};

export const addAllCommunities = janusAccount => {
  if (!janusAccount) {
    return janusAccount;
  }

  return {
    ...janusAccount,
    all_communities: _.uniq(
      janusAccount.primary_institute_communities
        .concat(janusAccount.primary_unit_communities)
        .concat(janusAccount.communities)
    )
  };
};

function JanusAccount(client) {
  const janusAccountClient = client.link(JanusAccount.queries);

  const communityClient = Community(client);
  const instituteClient = Institute(client);
  const unitClient = Unit(client);
  const janusAccountInstituteClient = JanusAccountInstitute(client);
  const janusAccountUnitClient = JanusAccountUnit(client);
  const janusAccountCommunityClient = JanusAccountCommunity(client);

  const updateCommunities = entityAssigner(
    communityClient.selectByIds,
    communityClient.selectByJanusAccountId,
    janusAccountCommunityClient.unassignCommunityFromJanusAccount,
    janusAccountCommunityClient.assignCommunityToJanusAccount
  );

  const updateAdditionalInstitutes = entityAssigner(
    instituteClient.selectByIds,
    instituteClient.selectByJanusAccountId,
    janusAccountInstituteClient.unassignInstituteFromJanusAccount,
    janusAccountInstituteClient.assignInstituteToJanusAccount
  );

  const updateAdditionalUnits = entityAssigner(
    unitClient.selectByIds,
    unitClient.selectByJanusAccountId,
    janusAccountUnitClient.unassignUnitFromJanusAccount,
    janusAccountUnitClient.assignUnitToJanusAccount
  );

  const selectOneByUid = function*(...args) {
    const janusAccount = yield janusAccountClient.selectOneByUid(...args);

    return addDomains(janusAccount);
  };

  const selectEzTicketInfoForId = function* selectEzTicketInfoForId(...args) {
    const [result] = yield janusAccountClient.selectEzTicketInfoForId(...args);
    return {
      username: `${result.mail}_O_${result.cnrs ? "CNRS" : "OTHER"}_I_${
        result.institute
      }_OU_${result.unit}`,
      groups: [
        ..._.uniq(
          result.primary_institute_groups
            .concat(result.primary_unit_groups)
            .concat(result.groups)
        )
      ]
    };
  };

  const selectOne = function*(...args) {
    const janusAccount = yield janusAccountClient.selectOne(...args);

    return addAllCommunities(janusAccount);
  };

  const selectPage = function*(...args) {
    const janusAccounts = yield janusAccountClient.selectPage(...args);

    return janusAccounts.map(addAllCommunities);
  };

  const insertOne = function* insertOne(janusAccount) {
    try {
      yield client.begin();
      const insertedUser = yield janusAccountClient.insertOne(janusAccount);

      const communities = yield updateCommunities(
        janusAccount.communities,
        insertedUser.id
      );
      const additional_institutes = yield updateAdditionalInstitutes(
        janusAccount.additional_institutes,
        insertedUser.id
      );
      const additional_units = yield updateAdditionalUnits(
        janusAccount.additional_units,
        insertedUser.id
      );

      yield client.commit();

      return {
        ...insertedUser,
        communities,
        additional_institutes,
        additional_units
      };
    } catch (error) {
      yield client.rollback();
      throw error;
    }
  };

  const updateOne = function*(selector, janusAccount) {
    try {
      yield client.begin();

      let updatedUser;
      try {
        updatedUser = yield janusAccountClient.updateOne(
          selector,
          janusAccount
        );
      } catch (error) {
        if (error.message !== "no valid column to set") {
          throw error;
        }
        updatedUser = yield selectOne({ id: selector });
      }

      let communities;
      let additional_institutes;
      let additional_units;

      if (janusAccount.communities) {
        communities = yield updateCommunities(
          janusAccount.communities,
          updatedUser.id
        );
      }
      if (janusAccount.additional_institutes) {
        additional_institutes = yield updateAdditionalInstitutes(
          janusAccount.additional_institutes,
          updatedUser.id
        );
      }
      if (janusAccount.additional_units) {
        additional_units = yield updateAdditionalUnits(
          janusAccount.additional_units,
          updatedUser.id
        );
      }

      yield client.commit();

      return {
        ...updatedUser,
        communities,
        additional_institutes,
        additional_units
      };
    } catch (error) {
      yield client.rollback();
      throw error;
    }
  };

  const getSimilarUid = function* getSimilarUid(uid) {
    if (yield janusAccountClient.selectOneByUid(uid)) {
      return []; // not a new user so no check
    }

    const [, id] = uid.match(/^(.*?)\.[0-9]+$/) || [null, uid];

    return yield janusAccountClient.selectBySimilarUid(id);
  };

  function* getFavouriteResources(id) {
    const result = yield janusAccountClient.getFavouriteResources(id);

    return _.get(result, "[0].favourite_resources");
  }

  const selectAllForExport = function*() {
    const selectAdditionalInstitutesNames = `SELECT name
            FROM institute
            JOIN janus_account_institute ON (institute.id = janus_account_institute.institute_id)
            WHERE janus_account_institute.janus_account_id = janus_account.id
            ORDER BY index ASC`;
    /*const selectAdditionalUnitsCodes = `SELECT code
            FROM unit
            JOIN janus_account_unit ON (unit.id = janus_account_unit.unit_id)
            WHERE janus_account_unit.janus_account_id = janus_account.id
            ORDER BY index ASC`;*/
    const selectCommunitiesNames = `SELECT community.name
            FROM community
            JOIN janus_account_community ON (community.id = janus_account_community.community_id)
            WHERE janus_account_community.janus_account_id = janus_account.id
            ORDER BY index ASC`;
    const selectPrimaryInstituteCommunitiesNames = `SELECT community.name
            FROM community
            JOIN institute_community ON (community.id = institute_community.community_id)
            JOIN institute ON (institute_community.institute_id = institute.id)
            WHERE institute.id = janus_account.primary_institute
            ORDER BY index ASC`;
    const selectPrimaryUnitCommunitiesNames = `SELECT community.name
            FROM community
            JOIN unit_community ON (community.id = unit_community.community_id)
            JOIN unit ON (unit_community.unit_id = unit.id)
            WHERE unit.id = janus_account.primary_unit
            ORDER BY index ASC`;
    const dataForExport = yield client.query({
      sql: `SELECT janus_account.id, janus_account.uid, janus_account.name, janus_account.firstname,
                  janus_account.mail, janus_account.cnrs, janus_account.comment, 
                  janus_account.last_connexion, janus_account.first_connexion, janus_account.active, 
                  institute.name AS primary_institute,
                  unit.code AS primary_unit,
                  unit2.code AS additional_units,
                  ARRAY((${selectAdditionalInstitutesNames})) AS additional_institutes,
                  ARRAY((${selectCommunitiesNames})) AS communities,
                  ARRAY(
                    (${selectPrimaryInstituteCommunitiesNames})
                    UNION
                    (${selectPrimaryUnitCommunitiesNames})
                    UNION
                    (${selectCommunitiesNames})
                  ) AS all_communities 
                  FROM janus_account 
                  LEFT JOIN institute ON janus_account.primary_institute = institute.id
                  LEFT JOIN unit ON janus_account.primary_unit = unit.id
                  LEFT JOIN janus_account_unit ON (janus_account.id = janus_account_unit.janus_account_id)
                  LEFT JOIN unit AS unit2 ON (janus_account_unit.unit_id = unit2.id)`,
      parameters: {}
    });
    const listForExport = [];
    dataForExport.forEach(element => {
      const object = listForExport.find(n => n.id === element.id);
      if (object) {
        if (element.additional_units) {
          object.additional_units.push(element.additional_units);
        }
      } else {
        if (element.additional_units) {
          element.additional_units = [element.additional_units];
        } else {
          element.additional_units = [];
        }
        listForExport.push(element);
      }
    });
    return dataForExport;
  };

  return {
    ...janusAccountClient,
    updateCommunities,
    updateAdditionalInstitutes,
    updateAdditionalUnits,
    selectOneByUid,
    selectEzTicketInfoForId,
    selectOne,
    selectPage,
    insertOne,
    updateOne,
    getSimilarUid,
    getFavouriteResources,
    selectAllForExport
  };
}

JanusAccount.queries = janusAccountQueries;

export default JanusAccount;
