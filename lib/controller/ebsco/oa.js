import _ from 'lodash';
import { selectOne as selectOneInistAccount } from '../../models/InistAccount';
import { selectOne as selectOneInstitute } from '../../models/Institute';
import { selectOneByUid as selectJanusAccountByUid } from '../../models/JanusAccount';
import { selectOne as selectOneUnit } from '../../models/Unit';

import { httpLogger } from '../../services/logger';

export const redirectOA = function* () {
    const { sid, url, domaine, doi, user_id } = this.query;

    let user = null;
    if (this.state.cookie || user_id) {
        const id = user_id || this.state.cookie.id;

        user =
            (yield selectJanusAccountByUid(id)) ||
            (yield selectOneInistAccount(id));
    }

    if (user) {
        const isCnrs = !_.isNil(user.cnrs);

        const instituteId = isCnrs
            ? user.primary_institute
            : user.main_institute;
        const unitId = isCnrs ? user.primary_unit : user.main_unit;

        const institute = instituteId
            ? yield selectOneInstitute(instituteId)
            : null;
        const unit = unitId ? yield selectOneUnit(unitId) : null;

        httpLogger.info('open access', {
            sid,
            domaine,
            doi,
            login: isCnrs ? user.mail : user.username,
            O: isCnrs ? (user.cnrs == true ? 'CNRS' : 'OTHER') : 'UNKNOWN',
            I: institute ? institute.code : null,
            OU: unit ? unit.code : null,
            url,
        });
    } else {
        httpLogger.info('open access', {
            sid,
            domaine,
            doi,
            login: null,
            O: null,
            I: null,
            OU: null,
            url,
        });
    }

    this.redirect(url);
};
