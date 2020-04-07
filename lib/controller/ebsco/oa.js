import _ from 'lodash';

import { httpLogger } from '../../services/logger';

export const redirectOA = function*() {
    const { sid, url, domaine, doi } = this.query;

    const user =
        (yield this.janusAccountQueries.selectOneById(this.state.cookie.id)) ||
        (yield this.inistAccountQueries.selectOne({
            id: this.state.cookie.id,
        }));

    const instituteId = user.cnrs
        ? user.primary_institute
        : user.main_institute;
    const unitId = user.cnrs ? user.primary_unit : user.main_unit;

    const institute = instituteId
        ? yield this.instituteQueries.selectOne({
              id: instituteId,
          })
        : null;
    const unit = unitId
        ? yield this.unitQueries.selectOne({ id: unitId })
        : null;

    httpLogger.info('open access', {
        sid,
        domaine,
        doi,
        login: user.cnrs ? user.mail : user.username,
        O: !_.isNil(user.cnrs)
            ? user.cnrs == true
                ? 'CNRS'
                : 'OTHER'
            : 'UNKNOWN',
        I: institute ? institute.code : null,
        OU: unit ? unit.code : null,
        url,
    });

    this.redirect(url);
};
