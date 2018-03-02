import body from 'co-body';

export const postProfile = function*() {
    const { favorite_domain } = yield body(this);
    const { id } = this.state.cookie;

    yield this.janusAccountQueries.updateOne({ id }, { favorite_domain });

    this.body = {
        username: this.state.cookie.username,
        domains: this.state.cookie.domains,
        favorite_domain,
    };
};
