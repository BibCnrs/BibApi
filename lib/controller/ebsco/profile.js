import body from 'co-body';
import { updateOne } from '../../models/JanusAccount';

export const postProfile = function* () {
    const { favorite_domain } = yield body(this);
    const { id } = this.state.cookie;
    yield updateOne(id, { favorite_domain });

    this.body = {
        username: this.state.cookie.username,
        domains: this.state.cookie.domains,
        favorite_domain,
    };
};
