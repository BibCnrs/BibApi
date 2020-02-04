import { httpLogger } from '../../services/logger';
export const redirectOA = function*() {
    const { sid, url, domaine, doi } = this.query;

    const user =
        (yield this.janusAccountQueries.selectOneById(this.state.cookie.id)) ||
        (yield this.inistAccountQueries.selectOne({
            id: this.state.cookie.id,
        }));

    httpLogger.info(url, {
        sid,
        domaine,
        doi,
        mail: user.mail,
    });

    this.redirect(url);
};
