export const domains = function* domains() {
    this.body = (yield this.domainQueries.selectPage()).map(domain => domain.name);
};
